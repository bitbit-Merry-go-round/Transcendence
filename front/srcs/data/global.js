export default global = (() =>{
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

  return ({ user });
})();
