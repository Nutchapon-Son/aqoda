const fs = require('fs')

class Command {
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

function main() {
  const filename = 'input.txt'
  const commands = getCommandsFromFileName(filename)
  let rooms = []
  let keycards = []

  commands.forEach(command => {
    switch (command.name) {
      case 'create_hotel':
        const [floor, roomPerFloor] = command.params
        const hotel = { floor, roomPerFloor }
        rooms = createRooms(hotel)
        keycards = rooms.map((d, index) => ({no:index +1,roomNo:null}))

        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        )
        return
      case 'book':
        const [numberRoom, booker, age] = command.params
        bookRooms({ rooms, keycards, numberRoom, booker: { name: booker, age}})
        return;
      case 'list_available_rooms':
        listAvailableRooms({rooms})
        return;
      case 'checkout':
        const [cardId, name] = command.params
        checkOut({rooms,cardId,name,keycards});
        return;
      case 'list_guest':
        listGuest({rooms});
        return;
      case 'get_guest_in_room':
        const [roomNum] = command.params
        getGuestInRoom({rooms,roomNum});
        return;
      case 'list_guest_by_age':
        const [operator,num] = command.params
        listGuestByAge({rooms,operator,num});
        return;
        case 'list_guest_by_floor':
        const [fl] = command.params
          listGuestByFloor({rooms,fl});
        return;
        case 'checkout_guest_by_floor':
        const [checkOutFl] = command.params
          checkoutGuestByFloor({rooms,checkOutFl,keycards});
        return;
        case 'book_by_floor':
        const [bookFl, bookerName,bookerAge] = command.params
          bookByFloor({rooms,keycards,bookFl, bookerName,bookerAge});
        return;
      default:
        return
    }
  })
}

function checkOut({rooms,cardId,name,keycards}) {

  const card = keycards[keycards.findIndex((card)=>card.no === cardId)];
  const room = rooms[rooms.findIndex((room)=>room.numberRoom === card.roomNo)];

  if(room.booker.name === name){
    room.isBooked = false;
    room.booker = null;
    card.roomNo = null;
    console.log(`Room ${room.numberRoom} is checkout.`);
  }
  else{
    console.log(`Only ${room.booker.name} can checkout with keycard number ${room.keycardNo}.`)
  }


}

function listGuest({rooms}) {

  const guessNames = rooms.filter((room)=>room.booker).map((room)=>room.booker.name);

  console.log(guessNames.toString());
}

function getGuestInRoom({rooms,roomNum}) {

  const guessName = rooms.find((room)=>room.numberRoom === roomNum).booker.name;

  console.log(guessName)

}

function listGuestByAge({rooms,operator,num}) {

  const guessNames = rooms.filter((room)=>room.booker && eval(`${room.booker.age +operator+num}`)).map((room)=>room.booker.name);
  console.log(guessNames.toString());
}

function listGuestByFloor({rooms,fl}) {
  const guessNames = rooms.filter((room)=> {


    return room.booker && room.numberRoom.toString()[0] == fl
  }).map((room)=>room.booker.name);
  console.log(guessNames.toString());

}
function checkoutGuestByFloor({rooms,checkOutFl,keycards}) {

  const rentRoom = rooms.filter((room)=> room.isBooked && room.numberRoom.toString()[0] == checkOutFl)

  rentRoom.forEach((room)=>{
    const card = keycards[keycards.findIndex((card)=>card.no === room.keycardNo)];
      room.isBooked = false;
      room.booker = null;
      card.roomNo = null;
  })
  console.log(`Room ${rentRoom.map((room)=>room.numberRoom)} are checkout.`)

}

function bookByFloor({rooms,keycards,bookFl, bookerName,bookerAge}) {

  const isSomeRoomNotAvailable = rooms.filter((room)=>room.numberRoom.toString()[0] == bookFl && room.isBooked).length > 0
  const roomsOnFloor = rooms.filter((room)=>room.numberRoom.toString()[0] == bookFl)
  const bookedKeyCards = [];

  if(!isSomeRoomNotAvailable){
    roomsOnFloor.forEach((room)=>{
      const keyCard = bookRooms({ rooms, keycards, numberRoom:room.numberRoom, booker:{name:bookerName,age:bookerAge},noConsole:true});
      bookedKeyCards.push(keyCard);
    })
    console.log(`Room ${roomsOnFloor.map(room=>room.numberRoom).toString()} are booked with keycard number ${bookedKeyCards.toString()}`)
  }
    else{
      console.log(`Cannot book floor ${bookFl} for ${bookerName}.`)
    }
  }

function bookRooms ({ rooms, keycards, numberRoom, booker,noConsole}){

  let updateRoomIndex = rooms.findIndex(r => r.numberRoom === numberRoom)
  if(rooms[updateRoomIndex].isBooked){
    console.log(`Cannot book room ${numberRoom} for ${booker.name}, The room is currently booked by ${rooms[updateRoomIndex].booker.name}`)
    return;
  } else {
    const findAvailableKeyCardIndex =  keycards.findIndex((keyCard)=>!keyCard.roomNo)

    rooms[updateRoomIndex].isBooked = true
    rooms[updateRoomIndex].booker = booker
    rooms[updateRoomIndex].keycardNo = keycards[findAvailableKeyCardIndex].no

    keycards[findAvailableKeyCardIndex].roomNo = numberRoom

    if(!noConsole)
    console.log(`Room ${numberRoom} is booked by ${rooms[updateRoomIndex].booker.name} with keycard number ${rooms[updateRoomIndex].keycardNo}.`)

    return rooms[updateRoomIndex].keycardNo ;
  }
}

function listAvailableRooms({rooms}) {
  const availableRoom = rooms.filter((room)=>!room.isBooked).map((room)=>room.numberRoom);

  console.log(availableRoom.toString());


}

function createRooms ({ floor, roomPerFloor }){
  let rooms = []
  for(let i=1;i <= floor; i++){
    for(let j=1; j <= roomPerFloor; j++){
      const info = {
        numberRoom: +`${i}0${j}`,
        isBooked: false,
        booker: {
          name: undefined,
          age: undefined,
        },
        keycardNo:null
      }
      rooms.push(info)
    }
  }

  return rooms
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, 'utf-8')

  return file
    .split('\n')
    .map(line => line.split(' '))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map(param => {
            const parsedParam = parseInt(param, 10)

            return Number.isNaN(parsedParam) ? param : parsedParam
          })
        )
    )
}

main()
