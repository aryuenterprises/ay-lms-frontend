import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import PropTypes from 'prop-types';

const ReactDraft = ({ editorState, onEditorStateChange }) => {
  return (
    <Editor
      editorState={editorState}
      toolbarClassName="toolbarClassName"
      wrapperClassName="wrapperClassName"
      editorClassName="editorClassName"
      onEditorStateChange={onEditorStateChange}
      toolbar={{
        options: [
          'inline',
          'blockType',
          'fontSize',
          'fontFamily',
          'list',
          'textAlign',
          'colorPicker',
          'link',
          'embedded',
          'emoji',
          'image',
          'remove',
          'history'
        ],
        colorPicker: {
          colors: [
            'rgb(97,189,109)', // green
            'rgb(26,188,156)', // teal
            'rgb(84,172,210)', // blue
            'rgb(44,130,201)', // dark blue
            'rgb(147,101,184)', // purple
            'rgb(71,85,119)', // dark gray
            'rgb(204,204,204)', // light gray
            'rgb(0,0,0)', // black
            'rgb(255,255,255)', // white
            'rgb(244,67,54)', // red
            'rgb(233,30,99)', // pink
            'rgb(156,39,176)', // purple
            'rgb(103,58,183)', // deep purple
            'rgb(63,81,181)', // indigo
            'rgb(33,150,243)', // blue
            'rgb(0,188,212)', // cyan
            'rgb(0,150,136)', // teal
            'rgb(76,175,80)', // green
            'rgb(139,195,74)', // light green
            'rgb(205,220,57)', // lime
            'rgb(255,235,59)', // yellow
            'rgb(255,193,7)', // amber
            'rgb(255,152,0)', // orange
            'rgb(255,87,34)', // deep orange
            'rgb(121,85,72)' // brown
          ]
        },
        inline: {
          options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
          // Add color to inline styles
          className: undefined,
          component: undefined,
          dropdownClassName: undefined
        }
      }}
    />
  );
};

ReactDraft.propTypes = {
  editorState: PropTypes.object.isRequired,
  onEditorStateChange: PropTypes.func.isRequired
};

export default ReactDraft;
