import { Context, env, logging, PersistentMap, PersistentVector, storage } from 'near-sdk-as'
import { PostSong, Returnedsong, Vote, songs } from './classes';

 export function getPostSongs(target: string): Returnedsong[] {
  assert(Context.predecessor == Context.sender)

  const result = new Array<Returnedsong>()
  const forMe = (target == 'me')
  // logging.log('getsongs: sender = ' + Context.sender + ', target = ' + target + ', forMe = ' + forMe.toString())

  for(let i = 0; i < songs.length; ++i) {
    // logging.log('getsongs: song = ' + songs[i].who + ', songs[i].who === Context.sender = ' + (songs[i].who == Context.sender).toString())

    let song = songs[i]
    if(forMe == true) {
      if(song.name == Context.sender)
        result.push(new Returnedsong(i, song))
    } else {
      var isPublicNotMinesong = song.canView.size == 0 && song.name != Context.sender
      var canViewsong = (isPublicNotMinesong ? true : song.canView.has(Context.sender))

      if(canViewsong)
        result.push(new Returnedsong(i, song))
    }
  }
  return result;
 }

export function vote(songId: i32, value: boolean) : Returnedsong {
  assert(Context.predecessor == Context.sender)
  assert(songId >= 0 && songId < songs.length)

  logging.log('vote: sender = ' + Context.sender + ', songId = ' + songId.toString() + ', value = ' + value.toString() + ', total songs = ' + songs.length.toString())
  let song = songs[songId];

  let isPublicsong = song.canVote.size == 0
  let isAllowedToVote = isPublicsong ? (song.name != Context.sender) : song.canVote.has(Context.sender)
  assert(isAllowedToVote)

  let newVote = value == true ? Vote.like : Vote.dislike
  if(song.votes.has(Context.predecessor)) {
    logging.log('vote: re-vote...')

    let voteValue = song.votes.get(Context.predecessor);
    logging.log('voteValue = ' + voteValue.toString())

    if(newVote != voteValue) {
      logging.log('value != voteValue')

      song.votes.set(Context.predecessor, newVote);
      if(voteValue == Vote.like) {
        logging.log('re-vote to dislike')

        song.vote_like -= 1
        song.vote_dislike += 1 
      } else {
        logging.log('re-vote to like')

        song.vote_like += 1
        song.vote_dislike -= 1
      }
    } 
    else 
    {
      logging.log('value = voteValue = ' + value.toString())
    }
  } else {
    logging.log('vote: new vote...')

    song.votes.set(Context.predecessor, newVote);
    if(value == true) {
      logging.log('vote to like')
      song.vote_like += 1
    } else {
      logging.log('vote to dislike')
      song.vote_dislike += 1
    }
  }

  logging.log('vote: replacing songId ' + songId.toString() + ' with song = '
   + song.vote_like.toString() + "/" + song.vote_dislike.toString())

  songs.replace(songId, song);
  return new Returnedsong(songId, songs[songId])
}

export function makeExtendedPostSong(what: string, viewers: string[], voters: string[]) : Returnedsong {
  assert(Context.predecessor == Context.sender)

  var song = new PostSong(what)
  for(let i = 0; i < viewers.length; ++i) {
    let viewer = viewers[i];
    assert(env.isValidAccountID(viewer), "viewer account is invalid")

    logging.log('adding viewer: ' + viewer)
    song.canView.add(viewer)
  }

  for(let i = 0; i < voters.length; ++i) {
    let voter = voters[i];
    assert(env.isValidAccountID(voter), "voter account is invalid")

    logging.log('adding voter: ' + voter)
    song.canVote.add(voter)

    // all voters are viewers too, otherwise how can they vote?
    logging.log('adding voter to viewers: ' + voter)
    song.canView.add(voter)
  }

  songs.push(song);
  return new Returnedsong(songs.length - 1, songs[songs.length - 1])
}

export function makePostSong(what: string) : Returnedsong {
  assert(Context.predecessor == Context.sender)

  songs.push(new PostSong(what));
  return new Returnedsong(songs.length - 1, songs[songs.length - 1])
}

// debug only 
export function clearAll(): void {
  assert(Context.predecessor == Context.sender)

  while(songs.length !== 0)
    songs.pop();
}
