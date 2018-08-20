const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.js')
const YTDL = require('ytdl-core')
const fs = require('fs')

let song_q = 0
server = {}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  });
  
client.on('message', msg => {
    const arg =  msg_handle(msg.content)

    

    switch (arg[0].toLowerCase()){
        case '#add':
            if(!arg[1]){
                msg.channel.sendMessage('Please provide a youtube link !')
                return
            }
        
            if(!msg.member.voiceChannel){
                msg.channel.sendMessage('You must be in a voice channel !')
                return
            }else{
                add(arg[1], msg)
            }
            
            break
        case '#play':
            if(!msg.member.voiceChannel){
                msg.channel.sendMessage('You must be in a voice channel !')
                return
            }
            msg.member.voiceChannel.join().then(connection =>{
                song_q = 0
                play(connection, msg)
            }).catch(e=>console.log('Connection error '+e))
            
            

            break

        case '#del':
            del(song_q-1)
            msg.channel.sendMessage('Deleted current song !')
            break

        case '#skip':
            msg.channel.sendMessage('skipped !')
            server.play.end()
            
            break
        case '#random':
            ran()
            msg.channel.sendMessage('Finished random !')
            break
    }

    
})

function add(link, msg){
    var logger = fs.createWriteStream('./store/songs.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
    })
    logger.write(link+'\n')
    logger.end()
    msg.channel.sendMessage('Added ' + link + ' to songlist successful !')
}

function play(connection, msg){
  
    var data = fs.readFileSync('./store/songs.txt', 'utf8')  
    var songs = data.split('\n')
    
   

    msg.channel.sendMessage('Start to play :'+songs[song_q])
    try{
        server.play = connection.playStream(YTDL(songs[song_q], {filter: 'audioonly'})) 
        
    }
    catch(e){
        msg.channel.sendMessage('Error: Invalid link , deleted , please type #play again !')
        del(song_q)
        
    }
    

    

    server.play.on('end', ()=>{
        song_q++
        console.log('play next')
        console.log(song_q)
        console.log(songs.length)
        if(song_q > songs.length-2){
            song_q = 0
        }
        play(connection, msg)
    })
}

function del(q){
    var data = fs.readFileSync('./store/songs.txt', 'utf8')
    var songs = data.split('\n')
    var logger = fs.createWriteStream('./store/songs.txt', {
        flags: 'w' // 'a' means appending (old data will be preserved)
    })
    
    songs.splice(q, 1)           
    
    logger.write(songs.join('\n'))
    logger.end()
}

function msg_handle(msg){
    let arg = []
    arg = msg.split(' ')
    return arg
}

function ran(){
    var data = fs.readFileSync('./store/songs.txt', 'utf8')
    var songs = data.split('\n')
    var logger = fs.createWriteStream('./store/songs.txt', {
        flags: 'w' // 'a' means appending (old data will be preserved)
    })

    newsongs = shuffle(songs)
    logger.write(newsongs.join('\n'))
    logger.end()

    function shuffle(array) {
        var currentIndex = array.length-1, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    }
}



client.login(config.token)