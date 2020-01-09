module.exports = (result) => {
    let hScore=0;
    let totalItems=0;
    let topPopArtist = {popularity:0};
    let leastPopArtist = {popularity:100};
    let topPopTrack = {popularity:0};
    let leastPopTrack = {popularity:100};
    
    if(result[0]){
        result[0].items.map(i=>{
            if(i.popularity>topPopArtist.popularity) {
                let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
                topPopArtist.name = i.name;
                topPopArtist.popularity = i.popularity;
                topPopArtist.imgUrl = imgUrl;
            }
            if(i.popularity<leastPopArtist.popularity) {
                let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
                leastPopArtist.name = i.name;
                leastPopArtist.popularity = i.popularity;
                leastPopArtist.imgUrl = imgUrl;
            }
            hScore += 100 - i.popularity;
            totalItems++;
        })
    }
    if(result[1]){
        result[1].items.map(i=>{
            let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
            if(i.popularity>topPopArtist.popularity) {
                topPopArtist.name = i.name;
                topPopArtist.popularity = i.popularity;
                topPopArtist.imgUrl = imgUrl;
            }
            if(i.popularity<leastPopArtist.popularity) {
                let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
                leastPopArtist.name = i.name;
                leastPopArtist.popularity = i.popularity;
                leastPopArtist.imgUrl = imgUrl;
            }
            hScore += 100 - i.popularity;
            totalItems++;
        })
    }
    if(result[2]){
        result[2].items.map(i=>{
            let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
            if(i.popularity>topPopArtist.popularity) {
                topPopArtist.name = i.name;
                topPopArtist.popularity = i.popularity;
                topPopArtist.imgUrl = imgUrl;
            }
            if(i.popularity<leastPopArtist.popularity) {
                leastPopArtist.name = i.name;
                leastPopArtist.popularity = i.popularity;
                leastPopArtist.imgUrl = imgUrl;
            }
            hScore += 100 - i.popularity;
            totalItems++;
        })
    }
    if(result[3]){
        result[3].items.map(i=>{
            let imgUrl = i.album.images ? (i.album.images[1] ? i.album.images[1].url : "") : "";
            if(i.popularity>topPopTrack.popularity) {
                topPopTrack.name = i.name;
                topPopTrack.popularity = i.popularity;
                topPopTrack.imgUrl = imgUrl;
            }
            if(i.popularity<leastPopTrack.popularity) {
                leastPopTrack.name = i.name;
                leastPopTrack.popularity = i.popularity;
                leastPopTrack.imgUrl = imgUrl;
            }
            hScore += 100 - i.popularity;
            totalItems++;
        })
    }
    if(result[4]){
    result[4].items.map(i=>{
        let imgUrl = i.album.images ? (i.album.images[1] ? i.album.images[1].url : "") : "";
        if(i.popularity>topPopTrack.popularity) {
            topPopTrack.name = i.name;
            topPopTrack.popularity = i.popularity;
            topPopTrack.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopTrack.popularity) {
            leastPopTrack.name = i.name;
            leastPopTrack.popularity = i.popularity;
            leastPopTrack.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
    })
    }
    if(result[5]){
        result[5].items.map(i=>{
            if(i.popularity>topPopTrack.popularity) {
                let imgUrl = i.album.images ? (i.images[1] ? i.album.images[1].url : "") : "";
                topPopTrack.name = i.name;
                topPopTrack.popularity = i.popularity;
                topPopTrack.imgUrl = imgUrl;
            }
            if(i.popularity<leastPopTrack.popularity) {
                let imgUrl = i.album.images ? (i.album.images[1] ? i.album.images[1].url : "") : "";
                leastPopTrack.name = i.name;
                leastPopTrack.popularity = i.popularity;
                leastPopTrack.imgUrl = imgUrl;
            }
            hScore += 100 - i.popularity;
            totalItems++;
        });
    }

    let hipsterScore = (hScore/totalItems).toFixed(2);
    let bestOf = {
        "topArtist":topPopArtist,
        "leastArtist":leastPopArtist,
        "topTrack":topPopTrack,
        "leastTrack":leastPopTrack
    };
    return {
        hipsterScore: hipsterScore,
        bestOf: bestOf
    }
}
