$(document).ready(function() {
    console.log('start')
    $.ajax({
        dataType: "json",
        url: 'js/playlist.json',
        success: function(data) {
            let dataTracks = data.tracks.items
            let tracksArray = []

            $.each(dataTracks, function(i, obj) {
                    var t = dataTracks[i].track
                    var trackObj = {
                        artist: t.artists[0].name,
                        album: t.album.name,
                        name: t.name,
                        art: t.album.images[0].url,
                        url: t.preview_url,
                        popularity: t.popularity
                    }
                    tracksArray.push(trackObj)
                })
                // log for debug
                //console.log(tracksArray)
                // Display each track
            let DisplayTrack = (item) => {
                    $.get('templates/track.html', function(templates) {
                        // Fetch the <script /> block from the loaded external
                        // template file which contains our track template.
                        var template = $(templates).filter('#trackTemplate').html()
                        let tracklist = Mustache.render(template, item)
                        $('.playlister_wrapper').append(tracklist)
                    })
                }
                // $.get('templates/track.html', function(templates) {
                //     // Fetch the <script /> block from the loaded external
                //     // template file which contains our track template.
                //     var template = $(templates).filter('#trackTemplate').html()
                //     $.each(tracksArray, function(i, obj) {
                //         let tracktemplate = ''
                //         //let tracklist = Mustache.render(template, tracksArray[i])
                //         let tracklist = Mustache.render(template, item)
                //         $('.playlister_wrapper').append(tracklist)
                //     })
                // })


            let MostPopular = (sort) => {
                tracksArray.map(function(item) {
                    if (item['popularity'] > sort) {
                        DisplayTrack(item)
                    }
                })
            }

            let SortAZTracks = (sort) => {
                tracksArray.map(function(item) {
                    console.log(item)
                    if (item['artist'].charAt(0) == sort) {
                        var trackLayout = '<article class="card-post card-track"><div class="inner"><header><img src="' + item.art + '" /><h2>' + item.artist + '</h2></header><div class="content"><cite><strong>Album: </strong>' + item.album + '<br/><strong>Track: </strong>' + item.name + '</cite><div class="audio-controls"><progress max="30" value="0"></progress><br /><button data-state="play"><i class="icon-play"></i></button></div><audio controls><source src="' + item.url + '" type="audio/mpeg">Your browser does not support the audio element.</audio></div></div></article>'
                        $('.playlister_wrapper').append(trackLayout)

                    }
                })
            }

            MostPopular(70)


            $('.filter-az li a').on('click', function(e) {
                e.preventDefault()
                $('.playlister_wrapper').html("")
                SortAZTracks($(this).html())
                $('.drop-down, .drop-down-toggle').removeClass('is-active')
            })

        }
    })
    let progressIndication

    function startProgress(currentPlayer) {
        // console.info('start progress', currentPlayer)
        // progress Indicator
        let max = $(currentPlayer.progress).attr('max')
        let i = $(currentPlayer.progress).attr('value')
        progressIndication = setInterval(function() {
            $(currentPlayer.progress).attr('value', currentPlayer.audio.currentTime)
            if (currentPlayer.audio.currentTime >= max) {
                stopProgress(progressIndication, currentPlayer)
            }
        }, 100)
    }

    function stopProgress(progressIndication, currentPlayer) {
        // console.info('stop progress')
        clearInterval(progressIndication)
        if ($(currentPlayer.progress).attr('value') >= $(currentPlayer.progress).attr('max')) {
            $(currentPlayer.progress).attr('value', 0)
            toggleButtonState(currentPlayer, 'play')
        }
    }

    function toggleButtonState(currentPlayer, state) {
        console.log('toggle', currentPlayer.button[0])
        $(currentPlayer.button[0]).html(state)
        $(currentPlayer.button[0]).attr('data-state', state)
    }

    $('body').on('click', '.card-track .audio-controls button', function() {
        let currentPlayer = {
                button: $(this),
                audio: $(this).parent().parent().find('audio')[0],
                progress: $(this).parent().find('progress')[0]
            }
            // @TODO: remove after testing

        currentPlayer.audio.volume = 1
        if (currentPlayer.audio.paused == false) {
            // If the track is already playing...
            // console.info('Track is now PAUSED')
            stopProgress(progressIndication, currentPlayer)
            currentPlayer.audio.pause()
            toggleButtonState(currentPlayer, 'play')

        } else {
            // If the track is currently paused
            console.info('Track is now PLAYING')
            toggleButtonState(currentPlayer, 'pause')
            for (let i = 0; i < $('audio').length; i++) {
                $('audio')[i].pause()
                $('button').attr('data-state', 'play').html('play')
                toggleButtonState(currentPlayer, 'pause')
            }
            startProgress(currentPlayer)
            currentPlayer.audio.play()
        }


    })
    console.log('end')
})

// DROPDOWN
$('.drop-down-toggle').on('click', function(e) {
    let dropdown = $(this)["0"].nextElementSibling
    if ($(this).hasClass('is-active')) {
        $(this).removeClass('is-active')
        $(dropdown).removeClass('is-active')
    } else {
        $('.drop-down-toggle.is-active, .drop-down.is-active').toggleClass('is-active')
        $(this).addClass('is-active')
        $(dropdown).addClass('is-active')
    }



})
