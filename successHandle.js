const headers = require("./headers");

function successHandle(res, data, message) {
  res.writeHead(200, headers());
  res.write(
    JSON.stringify({
      status: "success",
      data,
      ...message,
    }),
  );
  res.end();
}

module.exports = successHandle;
