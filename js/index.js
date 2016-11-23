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
                        url: t.preview_url
                    }
                    tracksArray.push(trackObj)
                })
                // log for debug
            console.log(tracksArray)
                // Display each track
            $.get('templates/track.html', function(templates) {
                // Fetch the <script /> block from the loaded external
                // template file which contains our track template.
                var template = $(templates).filter('#trackTemplate').html()
                $.each(tracksArray, function(i, obj) {
                    let tracktemplate = ''
                    let tracklist = Mustache.render(template, tracksArray[i])
                    $('.playlister_wrapper').append(tracklist)
                })
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
        // console.log('toggle', currentPlayer.button[0])
        $(currentPlayer.button[0]).html(state)
        $(currentPlayer.button[0]).attr('data-state', state)
    }

    $('body').on('click', '.track_wrapper .audio-controls button', function() {
        let currentPlayer = {
                button: $(this),
                audio: $(this).parent().parent().find('audio')[0],
                progress: $(this).parent().find('progress')[0]
            }
            // @TODO: remove after testing

        currentPlayer.audio.volume = 0.5
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
