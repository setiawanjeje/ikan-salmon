import React from "react";
import styles from "./Button.module.scss";

const Button = (props) => {
  const { children, ...rest } = props;

  return (
    <button className={styles.button} {...rest}>
      <span>{children}</span>
    </button>
  );
};

export default Button;
