import { makePostSong, getPostSongs, vote, makeExtendedPostSong } from '../../assembly';
import { storage, Context, runtime_api, VMContext, logging } from "near-sdk-as";

const someContract = "somecontract.testnet"
const wcom = 'wcom.testnet';
const allcharmian = "allcharmian.testnet"
const chiles = "chiles.testnet"
const elote = "elote.testnet"
const smartio = "smartio.testnet"

describe("PostSong", () => {

    beforeEach(() => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)
    });

    itThrows("disallow make PostSong on behalf", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(someContract)
        makePostSong("test PostSong")
    });

    it("should create PostSong", () => {
        var song = makePostSong("test PostSong");
        expect(song.id).toStrictEqual(0)
        expect(getPostSongs('me').length).toStrictEqual(1);    
        expect(getPostSongs('').length).toStrictEqual(0);
        expect(getPostSongs('me')[0].song.name).toStrictEqual(allcharmian);
        log("PostSong created by: " + getPostSongs('me')[0].song.name);    
    });

    it("should create two PostSongs by the same creator", () => {
        var song1 = makePostSong("test PostSong");
        expect(song1.id).toStrictEqual(0)
        var song2 = makePostSong("test PostSong 2");
        expect(song2.id).toStrictEqual(1)
        expect(getPostSongs('me').length).toStrictEqual(2);    
        expect(getPostSongs('').length).toStrictEqual(0);
        log("total PostSongs created: " + "by " + allcharmian + ": " + getPostSongs('me').length.toString());
        log("total PostSongs created: " + "by others " + ": " + getPostSongs('').length.toString());
    });

    it("should create two PostSongs by different creators", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makePostSong("allcharmian's PostSong");
        expect(song1.song.name).toStrictEqual(allcharmian);
        expect(getPostSongs('me').length).toStrictEqual(1);    
        expect(getPostSongs('').length).toStrictEqual(0);    

        VMContext.setSigner_account_id(chiles)
        VMContext.setPredecessor_account_id(chiles)

        var song2 = makePostSong("chiles's PostSong");
        expect(song2.song.name).toStrictEqual(chiles);
        expect(getPostSongs('me').length).toStrictEqual(1);    
        expect(getPostSongs('').length).toStrictEqual(1);    

        VMContext.setSigner_account_id(elote)
        VMContext.setPredecessor_account_id(elote)

        expect(getPostSongs('me').length).toStrictEqual(0);    
        expect(getPostSongs('').length).toStrictEqual(2);    
    });

    itThrows("should disallow to vote for own public PostSong", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makePostSong("allcharmian's PostSong");
        vote(song1.id, true);
    });

    it("should allow to vote for other's public PostSong", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makePostSong("allcharmian's PostSong");

        VMContext.setSigner_account_id(chiles)
        VMContext.setPredecessor_account_id(chiles)

        song1 = vote(song1.id, true);
        expect(song1.song.vote_like).toStrictEqual(1);
        expect(song1.song.vote_dislike).toStrictEqual(0);

        song1 = vote(song1.id, true);
        expect(song1.song.vote_like).toStrictEqual(1);
        expect(song1.song.vote_dislike).toStrictEqual(0);

        song1 = vote(song1.id, false);
        expect(song1.song.vote_like).toStrictEqual(0);
        expect(song1.song.vote_dislike).toStrictEqual(1);

        VMContext.setSigner_account_id(elote)
        VMContext.setPredecessor_account_id(elote)

        song1 = vote(song1.id, false);
        expect(song1.song.vote_like).toStrictEqual(0);
        expect(song1.song.vote_dislike).toStrictEqual(2);

        song1 = vote(song1.id, false);
        expect(song1.song.vote_like).toStrictEqual(0);
        expect(song1.song.vote_dislike).toStrictEqual(2);
    });

    itThrows("should disallow PostSong creation with invalid viewers", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", ["blablabla"], []);
        vote(song1.id, true);
    });

    itThrows("should disallow PostSong creation with invalid voters", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [], ["blablabla"]);
        vote(song1.id, true);
    });

    itThrows("should create private PostSong with no voters", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [chiles], []);
        vote(song1.id, true);
    });

    itThrows("should disallow to vote for own private PostSong if not in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [chiles], []);
        vote(song1.id, true);
    });

    it("should allow to vote for own private PostSong if in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [chiles, allcharmian], [allcharmian]);
        vote(song1.id, true);
    });

    itThrows("should disallow to vote for other's private PostSong if not in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [chiles, allcharmian], [chiles]);

        VMContext.setSigner_account_id(elote)
        VMContext.setPredecessor_account_id(elote)

        vote(song1.id, true);
    });

    it("should allow to vote for other's private PostSong if in voters list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [chiles, allcharmian], [chiles]);

        VMContext.setSigner_account_id(chiles)
        VMContext.setPredecessor_account_id(chiles)

        vote(song1.id, true);
    });

    it("should return only private PostSongs where in viewers list", () => {
        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var song1 = makeExtendedPostSong("allcharmian's PostSong", [chiles], [chiles, allcharmian, smartio]);
        expect(song1.song.canView.has(chiles)).toStrictEqual(true);
        expect(song1.song.canView.has(allcharmian)).toStrictEqual(true);
        expect(song1.song.canVote.has(chiles)).toStrictEqual(true);
        expect(song1.song.canVote.has(allcharmian)).toStrictEqual(true);

        VMContext.setSigner_account_id(elote)
        VMContext.setPredecessor_account_id(elote)

        var elotessongs = getPostSongs("others");
        expect(elotessongs.length).toStrictEqual(0)

        VMContext.setSigner_account_id(chiles)
        VMContext.setPredecessor_account_id(chiles)

        var chilesssongs = getPostSongs("others");
        expect(chilesssongs.length).toStrictEqual(1)

        VMContext.setSigner_account_id(allcharmian)
        VMContext.setPredecessor_account_id(allcharmian)

        var allcharmianssongs = getPostSongs("others");
        expect(allcharmianssongs.length).toStrictEqual(1)

        VMContext.setSigner_account_id(smartio)
        VMContext.setPredecessor_account_id(smartio)

        var smartiossongs = getPostSongs("others");
        expect(smartiossongs.length).toStrictEqual(1)
    });

});