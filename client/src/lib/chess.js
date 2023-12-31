/**
 * Clean position string
 */
export function cleanPosition(position) {
  let newPosition = position.replace(/\+/g, "");
  newPosition = newPosition.replace(/=\w+/g, "");
  newPosition = newPosition.replace(/\#/g, "");
  return newPosition.slice(-2);
}

/**
 * Convert fen string to array of pieces
 */
export function fenToArray(fen) {
  const ranks = fen.split(" ")[0].split("/");
  const chessArray = [];

  // Define an object for each piece type and its corresponding emoji
  const pieceEmojis = {
    k: "<i class='fa-solid fa-chess-king'></i>",
    q: "<i class='fa-solid fa-chess-queen'></i>",
    r: "<i class='fa-solid fa-chess-rook'></i>",
    b: "<i class='fa-solid fa-chess-bishop'></i>",
    n: "<i class='fa-solid fa-chess-knight'></i>",
    p: "<i class='fa-solid fa-chess-pawn'></i>",
    K: "<i class='fa-regular fa-chess-king'></i>",
    Q: "<i class='fa-regular fa-chess-queen'></i>",
    R: "<i class='fa-regular fa-chess-rook'></i>",
    B: "<i class='fa-regular fa-chess-bishop'></i>",
    N: "<i class='fa-regular fa-chess-knight'></i>",
    P: "<i class='fa-regular fa-chess-pawn'></i>"
  };

  for (let rank of ranks) {
    let currentRank = [];

    for (let char of rank) {
      if (!isNaN(char)) {
        // If the character is a number (empty squares)
        const emptySquares = parseInt(char);
        for (let i = 0; i < emptySquares; i++) {
          currentRank.push({
            emoji: " ",
            piece: null,
            position: null
          });
        }
      } else {
        // If the character represents a piece
        const pieceType = char;
        const emoji = pieceEmojis[pieceType];
        currentRank.push({
          emoji,
          piece: pieceType,
          position: null // The position will be set later
        });
      }
    }

    chessArray.push(currentRank);
  }

  // Set position for each cell
  const ranksCount = chessArray.length;
  const filesCount = chessArray[0].length;
  for (let rank = 0; rank < ranksCount; rank++) {
    for (let file = 0; file < filesCount; file++) {
      const cell = chessArray[rank][file];
      cell.position = String.fromCharCode(97 + file) + (ranksCount - rank);
    }
  }

  return chessArray;
}
