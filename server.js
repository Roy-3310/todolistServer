const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errorHandle");
const todos = [];
const headers = require("./headers");
const successHandle = require("./successHandle");

const requestListener = (req, res) => {
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
    successHandle(res, todos);
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
          successHandle(res, todos);
        } else {
          errHandle(res, "title 欄位為必填");
        }
      } catch (error) {
        errHandle(res, "資料格式錯誤，請確認 JSON 格式是否正確");
      }
    });
  } else if (req.url == "/todos" && req.method == "DELETE") {
    todos.length = 0;
    successHandle(res, todos, { delete: "yes" });
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers());
    res.end();
  } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
    // startsWith 用於檢測字串是否以指定的子字串開頭
    const id = req.url.split("/").pop();
    const index = todos.findIndex((element) => element.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      successHandle(res, todos);
    } else {
      errHandle(res, "找不到對應的 todo id");
    }
  } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
    req.on("end", () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex((element) => element.id === id);
        if (index === -1) {
          errHandle(res, "找不到對應的 todo id");
        } else if (todo === undefined) {
          errHandle(res, "title 欄位為必填");
        } else {
          todos[index].title = todo;
          successHandle(res, todos, { message: "更新成功" });
        }
      } catch (error) {
        errHandle(res, "資料格式錯誤，請確認 JSON 格式是否正確");
      }
    });
  } else {
    res.writeHead(404, headers());
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
server.listen(process.env.PORT || 3005);
