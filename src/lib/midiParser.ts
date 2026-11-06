import { Midi } from "@tonejs/midi";

export interface ParsedMidiSong {
  name: string;
  melody: number[];       // frequency array for typing
  autoMelody: number[];   // signature phrase (first 16 notes)
  bass: number[];         // bass accompaniment
  bpm: number;
}

// Convert MIDI note number to frequency
function midiNoteToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

export async function parseMidiFile(file: File): Promise<ParsedMidiSong> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  const bpm = midi.header.tempos.length > 0 ? Math.round(midi.header.tempos[0].bpm) : 120;
  const name = midi.name || file.name.replace(/\.midi?$/i, "");

  // Separate tracks into melody (higher notes) and bass (lower notes)
  // Find the track with the most notes as the primary melody track
  let melodyTrack = midi.tracks[0];
  let bassNotes: number[] = [];
  let melodyNotes: number[] = [];

  if (midi.tracks.length > 1) {
    // Sort tracks by average note pitch - highest average = melody
    const tracksWithAvg = midi.tracks
      .filter(t => t.notes.length > 0)
      .map(t => ({
        track: t,
        avgPitch: t.notes.reduce((sum, n) => sum + n.midi, 0) / t.notes.length,
        noteCount: t.notes.length,
      }));

    tracksWithAvg.sort((a, b) => b.avgPitch - a.avgPitch);

    if (tracksWithAvg.length >= 2) {
      // Highest pitch track = melody, lowest = bass
      melodyTrack = tracksWithAvg[0].track;
      const bassTrack = tracksWithAvg[tracksWithAvg.length - 1].track;
      bassNotes = bassTrack.notes
        .sort((a, b) => a.time - b.time)
        .slice(0, 32)
        .map(n => midiNoteToFreq(n.midi));
    } else {
      melodyTrack = tracksWithAvg[0].track;
    }
  }

  // Extract melody notes sorted by time
  const sortedNotes = melodyTrack.notes
    .slice()
    .sort((a, b) => a.time - b.time);

  melodyNotes = sortedNotes.map(n => midiNoteToFreq(n.midi));

  // If no bass found, generate from melody (use lower octave of root notes)
  if (bassNotes.length === 0) {
    bassNotes = melodyNotes.slice(0, 16).map(f => f / 2);
  }

  // Ensure minimum lengths
  if (melodyNotes.length < 8) {
    // Repeat what we have
    while (melodyNotes.length < 32) {
      melodyNotes = [...melodyNotes, ...melodyNotes];
    }
  }

  // Auto melody = first 16 unique-ish notes (the opening phrase)
  const autoMelody = melodyNotes.slice(0, 16);

  // Cap arrays to reasonable sizes
  const melody = melodyNotes.slice(0, 256);
  const bass = bassNotes.slice(0, 16);

  return { name, melody, autoMelody, bass, bpm };
}
