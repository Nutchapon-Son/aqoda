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

  commands.forEach(command => {
    switch (command.name) {
      case 'create_hotel':
        const [floor, roomPerFloor] = command.params
        const hotel = { floor, roomPerFloor }
        rooms = createRooms(hotel)
          console.log('rooms',rooms)

        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        )
        return
      default:
        return
    }
  })
}

function createRooms ({ floor, roomPerFloor }){
  let rooms = []
  for(let i=1;i <= floor; i++){
    for(let j=1; j <= roomPerFloor; j++){
      const info = {
        no: `${i}0${j}`,
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
