'use strict'

$(document).ready(function() {
    // Define your variables
    const user_id = 'thomasxbanks'
    const playlist_id = '12euo5zUOLXaNvfrfvmHsl'
    const access_token = 'BQD7nydYUdzFAPcswePV0oB5gua6qD6lz0V3wP8FLMS-MwlqatcwMWoj3UyZEh-wppeR8V3nI6cJsfZsN95pKphsJcXhtWjBkxt6WBgKpaW0xRGKoPudjlStq-FfEZpn6BdklQLlBJFjwWojtnjBvXI69G7Gov5h8A'

    // Get publicly available user information
    $.get('https://api.spotify.com/v1/users/' + user_id, function(data) {
        // Log for debug
        console.log('user id:', data)

        // If user does not have a defined avatar, use a generic Spotify logo
        if (!data.images[0]) {
            data.images = [{
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2000px-Spotify_logo_without_text.svg.png'
            }]
        }

        // Create the personalisation
        $('.user_id').html(data.id)
        $('img.user_avatar').attr('src', data.images[0].url).attr('alt', data.id)
        $('a.user_url').attr('href', data.external_urls.spotify)

        // Log for Debug
        //console.log('post', data)
    })



    // Get oAuth playlist data
    $.ajax({
        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id,
        context: document.getElementsByTagName('aside')[0],
        crossDomain: true,
        dataType: "json",
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + access_token
        }
    }).done(function(data) {
        // Log for debug
        console.log('authed:',data)

        let playlist = {
            title: data.name,
            description: data.description,
            image: data.images[0].url
        }

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
            // Log for debug
            //console.info(dataTracks)
            //console.log(tracksArray)

        // Display the playlist header
        let playlister = Mustache.render("<div class='playlist_wrapper' style='background-image: url({{image}})'><div><h1>{{title}}</h1></div><div><p>{{description}}</p></div></div>", playlist)
        $(this).html(playlister)

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

})
