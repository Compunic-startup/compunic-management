export function InputComponent({ type, placeholder, className, ...rest }) {
  return (
    <>
      <input
        type={type ? type : "text"}
        placeholder={placeholder ? placeholder : ""}
        className={className}
        {...rest}
      />
    </>
  );
}
