const axios = require("axios");
const tmi = require('tmi.js');
require("dotenv").config()

console.log('Iniciando Bot')

// Variaveis e constantes
const CHANNEL = process.env.CHANNEL;
const USER1 = process.env.USER3
const KEY1 = process.env.KEY3
var cliente = ""

//funçoes
function entrouNoChatDaTwitch(endereco, porta) {
    console.log(`* Bot entrou no endereço ${endereco}:${porta}`);
  }

function connectClient(user,key,channel){
  cliente = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
      reconnect: true,
      secure: true
    },
    identity: {
      username: user,
      password: key
    },
    channels: [ channel ]
  }); 
  console.log(user+" conectando na sala.")
  cliente.on('connected', entrouNoChatDaTwitch);
  cliente.connect().catch(console.error);
}

function responderMensagens(){
  // verificando as messagens do chat
  cliente.on('message', (channel, tags, message, self) => {
    //se for eu msm, nao responde
    if(self) return;
    //caso alguem fale !hello, retorna hello
    if(message.toLowerCase() === '!hello') {
      cliente.say(channel, `Olá, @${tags.username}!`);    
      //console.log(tags)
    }
    else if(message.toLowerCase().includes('!nivel')) {
      index = message.indexOf('!nivel')+6;
      nome = message.slice(index);
      console.log("buscando summoner")
      buscarSummoner(nome);
    }
    else if(message.toLowerCase().includes('!rank')) {
      index = message.indexOf('!rank')+5;
      nome = message.slice(index);
      console.log("buscando summoner")
      winrateSummoner(nome);
    }
  });
}

async function buscarSummoner(req,res){
  summonerPorNome = `${process.env.LOL_URL}/lol/summoner/v4/summoners/by-name/${encodeURI(
      req
    )}`+'?api_key='+process.env.LOL_APIKEY;
  
  await axios
  .get(summonerPorNome)
  .then(function(response){
      console.log("Tudo certo!")
      res = response;
    })
  .catch(function(error){console.log(error);})
  console.log(res.data.summonerLevel);
  cliente.say(CHANNEL, `Level: `+res.data.summonerLevel);
}

async function winrateSummoner(req,res){

  puuid = ""
  summonerId = ""
  idPartidas= []

  //buscando puuid do Invocador
  summonerPorNome = `${process.env.LOL_URL}/lol/summoner/v4/summoners/by-name/${encodeURI(
      req
    )}`+'?api_key='+process.env.LOL_APIKEY;
  //console.log(summonerPorNome)
  await axios
  .get(summonerPorNome)
  .then(function(response){
      console.log("Dados Summoner encontrados")
      //console.log(response.data.puuid);
      puuid = response.data.puuid;
      summonerId = response.data.id;
      //console.log(summonerId)
    })
  .catch(function(error){console.log(error);});

  tier= "";
  rank= "";
  leaguePoints= 0;
  wins= 0;
  loses= 0;

  //console.log(summonerId)
  uriStatus = `${process.env.LOL_URL}/lol/league/v4/entries/by-summoner/${
      summonerId
    }`+'?api_key='+process.env.LOL_APIKEY;
  //console.log(uriStatus)
  
  await axios
  .get(uriStatus)
  .then(function(response){
      console.log("Dados de Status encontrados")
      //console.log(response.data)
      tier= response.data[0].tier;
      rank= response.data[0].rank;
      leaguePoints= response.data[0].leaguePoints;
      wins= response.data[0].wins;
      loses= response.data[0].losses; 
  })
  .catch(function(error){console.log(error);});
  
  console.log("Elo: "+tier+" "+rank+" "+leaguePoints+" PDLs\nWinrate: "+wins*100/(wins+loses)+"%")
  cliente.say(CHANNEL, "Rank: "+tier+" "+rank+" "+leaguePoints+" PDLs\nWinrate: "+Math.round(wins*100*100/(wins+loses))/100+"%");
}
////////////////////////////////////////////////////////////////////////////////

connectClient(USER1,KEY1,CHANNEL)
responderMensagens()