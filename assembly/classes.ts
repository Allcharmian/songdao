import { Context, PersistentMap, PersistentVector } from "near-sdk-as";


export enum Vote {
    like,
    dislike
}
// clase de foundear cancion
/*
export class found{
  who: string;
  amount: u64;
}
 */

export class PostSong {
    name: string; //name
    vote_like: u64 = 0;
    vote_dislike: u64 = 0;
    time_song: u64 = 0;
    votes: Map<string, Vote> = new Map<string, Vote>();
    canView: Set<string> = new Set<string>();
    canVote: Set<string> = new Set<string>();
  
    constructor(public what: string) {
      this.name = Context.sender;
    }
  }

export class Returnedsong {
    constructor(public id: i32, public song: PostSong) {
    }    
}
export const songs = new PersistentVector<PostSong>("p");
