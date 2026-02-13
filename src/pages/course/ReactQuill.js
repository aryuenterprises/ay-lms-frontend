import { useState } from 'react';

// third-party
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ==============================|| EDITOR - QUILL ||============================== //

const ReactQuillDemo = () => {
  const [text, setText] = useState();
  const handleChange = (value) => {
    setText(value);
  };
  return <ReactQuill value={text} onChange={handleChange} />;
};

export default ReactQuillDemo;
