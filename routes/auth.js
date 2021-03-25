const express = require("express");
const router = require("router");

router.get("/api/signup", (req, res) => {
  res.json({
    data: "you hit signup endpoint",
  });
});
