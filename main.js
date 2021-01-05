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
        keycards = rooms.map((d, index) => index + 1)

        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        )
        return
      case 'book':
        const [numberRoom, booker, age] = command.params
        bookRooms({ rooms, keycards, numberRoom, booker: { name: booker, age}})
        return;
      default:
        return
    }
  })
}

function bookRooms ({ rooms, keycards, numberRoom, booker}){
  let cloneRooms = [...rooms]
  let updateRoom = rooms.find(r => r.numberRoom === numberRoom)
  if(updateRoom.isBooked){
    console.log(`Cannot book room ${numberRoom} for ${booker.name}, The room is currently booked by ${updateRoom.booker.name}.${updateRoom.numberRoom}`)
    return;
  } else {
    updateRoom.isBooked = true
    updateRoom.booker = booker
    updateRoom.keycard = keycards[0]
    cloneRooms = cloneRooms.filter(r => r.numberRoom === numberRoom)
    cloneRooms = cloneRooms.push(updateRoom)
    console.log('test', keycards.slice(1, keycards.length - 1))
    keycards = keycards.slice(1, keycards.length - 1)
    // FORD GU STUCK KEYCARD MUTATE MAI DAI
    return;
  }
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
        }
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
