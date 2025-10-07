import "../../instrument-server";
import { defineEventHandler } from "vinxi/http";

export default defineEventHandler(async () => {
  return ["Alice", "Bob", "Charlie"];
});
