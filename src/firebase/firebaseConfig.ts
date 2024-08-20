import { Firestore, DocumentReference } from "@google-cloud/firestore";


interface SongRecord {
    songRef: DocumentReference; // reference to song document
    plays: number;
}

interface UserDocument {
    id: string;
    songs: SongRecord[];
}

interface SongDocument {
    song: string;
    artist: string;
    track_id?: string;
}

const firestore = new Firestore();

export const userPlayedSong = async (userId: string, song: string, artist: string) => {
    try {
        const songDocId = `${song}_${artist}`;
        const songDocRef = firestore.collection('songs').doc(songDocId);
        const songDoc = await songDocRef.get();
        if(!songDoc.exists){
            await songDocRef.set({ song, artist } as SongDocument);
        }
        const userDocRef = firestore.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        const songRecord: SongRecord = {
            songRef: songDocRef,
            plays: 1,
        }
        if(userDoc.exists){
            const userData = userDoc.data() as UserDocument;
            if(!userData) {
                throw new Error(`User doc ${userId} is empty`);
            };
            const songs = userData.songs;
            const existingSongIndex = songs.findIndex(s => s.songRef.isEqual(songDocRef));
            if(existingSongIndex !== -1){
                songs[existingSongIndex].plays += 1;
            }else{
                songs.push(songRecord);
            }
            await firestore.doc(userDocRef.path).update({ songs });
            console.log(`Updated user ${userId} with song ${song} by ${artist}`);
        }else{
            // if the doc does not exist, create a new doc with song-artist pair
            await userDocRef.set({
                id: userId,
                songs: [songRecord],
            } as UserDocument);
            console.log(`Created new user ${userId} with song ${song} by ${artist}`);
        }
    } catch (error) {
        console.error(`Failed to update user ${userId} with song ${song} by ${artist}:`, error);
    }
};

export const getTop10Songs = async (userId: string) => {
    try { 
        const userDocRef = firestore.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        if(userDoc.exists){
            const userData = userDoc.data() as UserDocument;
            if(!userData) {
                throw new Error(`User doc ${userId} is empty`);
            };
            const songs = userData.songs;
            const fetchedSongs = await Promise.all(songs.map(async song => {
                const songDoc = await song.songRef.get();
                const songData = songDoc.data() as SongDocument;
                return songData && songData.track_id ? { ...songData, plays: song.plays } : null;
            }));
            // const songsWithSpotifyId = fetchedSongs.filter(song => song !== null && song.track_id);
            const songsWithSpotifyId = fetchedSongs.filter((song): song is SongDocument & { plays: number } => 
                song !== null && song.track_id !== undefined);
            const top10Songs = songsWithSpotifyId
                .sort((a, b) => b.plays - a.plays)
                .slice(0, 10);
            return top10Songs;
        }else{
            return [];
        }
    } catch (error) {
        console.error(`Failed to get top 10 songs for user ${userId}:`, error);
        return [];
    }
};