import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1180",
  database: "feedback_db",
  dateStrings: "date",
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("여기는 백엔드입니당");
});

// 전체 데이터 가져오는 API
app.get("/diet", (req, res) => {
  const q = "select * from diettb";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// diet 테이블에 데이터 추가
app.post("/diet", (req, res) => {
  const q = "insert into diettb (reg_date, food_code_no, food_name) values (?)";
  const values = [date(), req.body.code_no, req.body.food_name];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// (feedback)특정 id에 대한 데이터를 가져오는 API 추가
app.get("/feedback/:id", (req, res) => {
  const feedId = req.params.id;
  const q = "SELECT * FROM diettb WHERE diet_no = ?"; // diet_no가 id와 일치하는 데이터 조회
  db.query(q, [feedId], (err, data) => {
    if (err) return res.status(500).json(err); // 오류가 발생하면 500 상태 코드 반환
    if (data.length === 0) return res.status(404).json("Data not found"); // 데이터가 없으면 404 반환
    return res.json(data[0]); // 데이터가 있으면 첫 번째 결과 반환
  });
});

// 음식 이름별로 먹은 횟수를 계산하는 API
app.get("/diet-stats", (req, res) => {
  const q =
    "SELECT food_name, COUNT(*) as count FROM diettb GROUP BY food_name";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

// food_code_no에 맞는 음식을 날짜별로 먹은 횟수를 가져오는 API
app.get("/food-stats/:diet_no", (req, res) => {
  const dietNo = req.params.diet_no;

  // 먼저 diet_no에 맞는 food_code_no를 가져오는 쿼리
  const getFoodCodeQuery = "SELECT food_code_no FROM diettb WHERE diet_no = ?";

  db.query(getFoodCodeQuery, [dietNo], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length === 0) return res.status(404).json("Data not found");

    const foodCodeNo = data[0].food_code_no;

    // food_code_no에 맞는 날짜별 음식 섭취 횟수를 계산하는 쿼리
    const q = `
      SELECT reg_date, COUNT(*) as count 
      FROM diettb 
      WHERE food_code_no = ?
      GROUP BY reg_date
      ORDER BY reg_date
    `;

    db.query(q, [foodCodeNo], (err, stats) => {
      if (err) return res.status(500).json(err);
      return res.json(stats);
    });
  });
});

app.listen(8800, () => {
  console.log("백엔드 연결 성공");
});
