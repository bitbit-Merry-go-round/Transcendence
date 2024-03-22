import ObservableObject from "@/lib/observable_object";
import User, { createProfile } from "@/data/user";
import { GameData, Player } from "./game_data";

const globalData = (() =>{
  const user = new ObservableObject(new User({
    profile:
    createProfile({
      id: "heshin",
      level: 30,
      profileUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSEOCV5tCOWEb17GSCGh-mv8QfhjmWo-eIO-Go32AHeA&s" ,
    }), 
    friends: [ 
      createProfile({
        id: "jeseo",
        level: 25,
        profileUrl: "https://ca.slack-edge.com/T039P7U66-U03M2KCK5T6-e75d6c9b8cb3-512"
      }),
      ...["eunjiko", "hyecheon", "yham", 'test 1', 'test 2', 'test 3', 'test 4', 'test 5', 'test 6', 'test 7', 'test 8', 'test 9', 'test 10']
      .map(name => createProfile({id: name}))
    ],
  }))

  const bart = new Player({
    nickname: "bart"
  });
  const heshin = new Player({
    nickname: "heshin"
  });
  const gameData = new ObservableObject(new GameData({
    players: [bart, heshin],
  }));

  return ({ user, gameData });
})();

export default globalData;
