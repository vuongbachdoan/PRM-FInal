import React, { useEffect, useState } from "react";
import axios from "axios";

type PlayerDTO = {
  id: string,
  teamName: string;
  playerName: string;
  isCaptain: boolean;
  image: string;
  position: string;
  age: number;
  minutesPlayed: number,
  passingAccuracy: number
};

const API_ENDPOINT = "https://672263622108960b9cc43af6.mockapi.io/players";

const useMyData = () => {
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerDTO[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  useEffect(() => {
    axios
      .get(API_ENDPOINT)
      .then((response) => {
        setPlayers(response.data);
        setFilteredPlayers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching art tools data:", error);
      });
  }, []);

  const filterByTeam = (teamName: string) => {
    setSelectedTeam(teamName);
    if (teamName === "") {
      setFilteredPlayers(players);
    } else {
      setFilteredPlayers(players.filter((player) => player.teamName === teamName));
    }
  };

  return { players: filteredPlayers, filterByTeam, selectedTeam };
};

export default useMyData;
