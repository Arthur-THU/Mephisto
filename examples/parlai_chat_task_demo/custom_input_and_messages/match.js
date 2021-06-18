import Fuse from 'fuse.js' // 一个进行软匹配的库, https://fusejs.io/demo.html

const known_movies = [
];

function hardMatch(input_str) {  // 硬匹配
// 输入: 待匹配字符串 type: string
// 输出: 匹配的电影 type: array
    match_movies = [];
    known_movies.forEach(function(movie){
        if (movie.toLowerCase().match(input_str.toLowerCase())!=null) // 把电影名全部转换为小写
            match_movies.push(movie);
    })
    return match_movies;
}

function fuzzyMatch(input_str) {   // 软匹配
// 输入: 待匹配字符串 type: string
// 输出: 匹配的电影 type: json

    const options = {
        // isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        threshold: 0.1,    // 数字越小越严格
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        keys: [
        "title",
        "author.firstName"
        ]
    };

    const fuse = new Fuse(known_movies, options);
    
    return fuse.search(input_str)
}

console.log(fuzzyMatch("Ha"))