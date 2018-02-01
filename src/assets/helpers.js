const sendMessageNearby = function(map, centerX, centerY, centerZ, message) {
  const entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
  entities.forEach(entity => sendMessage(entity, message));
};

const sendMessage = function(recipient, message) {
  if (recipient.hasMixin("MessageRecipient")) {
    recipient.receiveMessage(message);
  }
};

const getNeighborPositions = function(x, y) {
  var tiles = [];
  for (let dX = -1; dX < 2; dX++) {
    for (let dY = -1; dY < 2; dY++) {
      if (dX == 0 && dY == 0) continue;
      tiles.push({ x: x + dX, y: y + dY });
    }
  }
  return tiles.randomize();
};

export { sendMessage, sendMessageNearby, getNeighborPositions };
