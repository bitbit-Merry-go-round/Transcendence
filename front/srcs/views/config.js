import GameView from "@/views/game/game_view";
import LoginView from "@/views/login/login_view";
import HomeView from "@/views/home/home_view";
import NavBar from "@/views/components/nav_bar";
import ProfileCard from "@/views/components/profile_card";
import MapSelector from "@/views/components/map_selector";

/**
 * fileName for view class MUST contain '_' or '-' (Web components requirement)
*/

export default {
  "default_dir": "/srcs/views/",
  "filePath": {
    "components": [
      {
        "className": "NavBar",
        "fileName": "nav_bar.html"
      },
      {
        "className": "ProfileCard",
        "fileName": "profile_card.html"
      },
      {
        "className": "MapSelector",
        "fileName": "map_selector.html"
      }
    ],
    "home": [ 
      {
        "className": "HomeView",
        "fileName": "home_view.html"
      }
    ],
    "login": [ 
      {
        "className": "LoginView",
        "fileName": "login_view.html"
      }
    ] ,
    "game": [ 
      {
        "className": "GameView",
        "fileName": "game_view.html"
      }
    ]
  }
}

export const viewConstructors = {
  GameView,
  HomeView,
  NavBar,
  LoginView,
  ProfileCard,
  MapSelector,
};
