const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errorHandle");
const todos = [];

const requestListener = (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  // console.log(req.url);
  // console.log(req.method);
  let body = "";
  let num = 0;
  req.on("data", (chunk) => {
    console.log(chunk);
    body += chunk;
    num += 1;
    console.log(num);
  });

  if (req.url == "/todos" && req.method == "GET") {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      }),
    );
    res.end();
  } else if (req.url == "/todos" && req.method == "POST") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          // console.log(title);
          const todo = {
            title: title,
            id: uuidv4(),
          };
          // console.log(todo);
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            }),
          );
          res.end();
        } else {
          errHandle(res);
        }
      } catch (error) {
        errHandle(res);
      }
    });
  } else if (req.url == "/todos" && req.method == "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
        delete: "yes",
      }),
    );
    res.end();
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
    // startsWith 用於檢測字串是否以指定的子字串開頭
    const id = req.url.split("/").pop();
    const index = todos.findIndex((element) => element.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          data: todos,
        }),
      );
      res.end();
    } else {
      errHandle(res);
    }
  } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
    req.on("end", () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex((element) => element.id === id);
        if (todo !== undefined && index !== -1) {
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            }),
          );
          res.end();
        } else {
          errHandle(res);
        }
      } catch {
        errHandle(res);
      }
    });
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網站路由",
      }),
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.POST || 3005);
