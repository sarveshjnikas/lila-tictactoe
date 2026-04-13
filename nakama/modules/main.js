var winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  
  function checkWinner(board) {
    for (var i = 0; i < winPatterns.length; i++) {
      var a = winPatterns[i][0], b = winPatterns[i][1], c = winPatterns[i][2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    for (var j = 0; j < board.length; j++) {
      if (board[j] === "") return "";
    }
    return "draw";
  }
  
  function matchInit(ctx, logger, nk, params) {
    var state = {
      board: ["","","","","","","","",""],
      currentTurn: "",
      playerX: "",
      playerO: "",
      winner: "",
      gameOver: false
    };
    logger.info("Match created");
    return { state: state, tickRate: 100, label: "tictactoe" };
  }
  
  function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    var count = 0;
    if (state.playerX !== "") count++;
    if (state.playerO !== "") count++;
    if (count >= 2) {
      return { state: state, accept: false, rejectMessage: "Match is full" };
    }
    return { state: state, accept: true };
  }
  
  function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
    for (var i = 0; i < presences.length; i++) {
      var presence = presences[i];
      if (state.playerX === "") {
        state.playerX = presence.userId;
        logger.info("Player X: " + presence.userId);
      } else if (state.playerO === "") {
        state.playerO = presence.userId;
        logger.info("Player O: " + presence.userId);
      }
    }
    if (state.playerX !== "" && state.playerO !== "") {
      state.currentTurn = state.playerX;
      dispatcher.broadcastMessage(1, JSON.stringify({
        type: "game_start",
        board: state.board,
        currentTurn: state.currentTurn,
        playerX: state.playerX,
        playerO: state.playerO
      }));
    }
    return { state: state };
  }
  
  function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
    for (var i = 0; i < presences.length; i++) {
      var presence = presences[i];
      if (!state.gameOver) {
        state.gameOver = true;
        state.winner = presence.userId === state.playerX ? state.playerO : state.playerX;
        dispatcher.broadcastMessage(4, JSON.stringify({
          type: "game_over",
          winner: state.winner,
          reason: "opponent_left"
        }));
      }
    }
    return { state: state };
  }
  
  function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
    if (state.playerX !== "" && state.playerO !== "" && !state.started) {
      state.started = true;
      dispatcher.broadcastMessage(1, JSON.stringify({
        type: "game_start",
        board: state.board,
        currentTurn: state.currentTurn,
        playerX: state.playerX,
        playerO: state.playerO
      }));
    }
  
    // Keep broadcasting game_over until match ends
    if (state.gameOver && state.winner) {
      dispatcher.broadcastMessage(4, JSON.stringify({
        type: "game_over",
        board: state.board,
        winner: state.winner,
        reason: "finished"
      }));
      if (tick - state.gameOverTick >= 10) return null;
      return { state: state };
    }
  
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      if (message.opCode !== 2) continue;
  
      var data = JSON.parse(nk.binaryToString(message.data));
      var userId = message.sender.userId;
  
      if (userId !== state.currentTurn) {
        dispatcher.broadcastMessage(3, JSON.stringify({
          type: "error",
          message: "Not your turn"
        }), [message.sender]);
        continue;
      }
  
      var index = data.index;
      if (index < 0 || index > 8 || state.board[index] !== "") {
        dispatcher.broadcastMessage(3, JSON.stringify({
          type: "error",
          message: "Invalid move"
        }), [message.sender]);
        continue;
      }
  
      state.board[index] = userId === state.playerX ? "X" : "O";
  
      var result = checkWinner(state.board);
      if (result !== "") {
        state.gameOver = true;
        state.gameOverTick = tick;
        state.winner = result === "draw" ? "draw" : (result === "X" ? state.playerX : state.playerO);
  
        if (state.winner !== "draw") {
          nk.leaderboardRecordWrite("tictactoe_wins", state.winner, {}, 1, 0, false);
        }
  
        dispatcher.broadcastMessage(4, JSON.stringify({
          type: "game_over",
          board: state.board,
          winner: state.winner,
          reason: "finished"
        }));
      } else {
        state.currentTurn = state.currentTurn === state.playerX ? state.playerO : state.playerX;
        dispatcher.broadcastMessage(2, JSON.stringify({
          type: "game_update",
          board: state.board,
          currentTurn: state.currentTurn
        }));
      }
    }
  
    return { state: state };
  }
  
  function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    return { state: state };
  }
  
  function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
    return { state: state, data: "" };
  }
  
  function findMatch(ctx, logger, nk, payload) {
    var matchList = nk.matchList(10, true, "tictactoe", null, 1, "*");
    var matchId;
    if (matchList.length > 0) {
      matchId = matchList[0].matchId;
    } else {
      matchId = nk.matchCreate("tictactoe", {});
    }
    return JSON.stringify({ matchId: matchId });
  }

  function listMatches(ctx, logger, nk, payload) {
    var matches = nk.matchList(20, true, "tictactoe", null, 1, "*");
    var result = [];
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i];
      result.push({
        matchId: match.matchId,
        players: match.size,
        label: match.label
      });
    }
    return JSON.stringify({ matches: result });
  }

  function setDisplayName(ctx, logger, nk, payload) {
    var data = JSON.parse(payload);
    nk.accountUpdateId(ctx.userId, null, data.displayName, null, null, null, null, null);
    return JSON.stringify({ success: true });
  }
  
  function InitModule(ctx, logger, nk, initializer) {
    initializer.registerMatch("tictactoe", {
      matchInit: matchInit,
      matchJoinAttempt: matchJoinAttempt,
      matchJoin: matchJoin,
      matchLeave: matchLeave,
      matchLoop: matchLoop,
      matchTerminate: matchTerminate,
      matchSignal: matchSignal
    });
  
    initializer.registerRpc("find_match", findMatch);
    initializer.registerRpc("list_matches", listMatches);
    initializer.registerRpc("set_display_name", setDisplayName);


  
    nk.leaderboardCreate("tictactoe_wins", false, "desc", "incr");
  
    logger.info("Tictactoe module loaded!");
  }