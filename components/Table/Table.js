import React from "react";
import style from "./Table.module.scss";

const Table = (props) => {
  return (
    <div className={style.tableWrapper}>
      <table className={style.table}>{props.children}</table>
    </div>
  );
};

export default Table;
