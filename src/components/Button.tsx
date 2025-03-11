
export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  specialProp?: string;
}

export default function Button (props: ButtonProps) {
  <button className='btn' {...props} />
}