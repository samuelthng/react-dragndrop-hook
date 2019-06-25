import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useContext
} from "react";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Chip,
  IconButton,
  Typography
} from "@material-ui/core";
import { FileCopy, Add } from "@material-ui/icons";
import useDropzone from "../hooks/useDropzone";

import { SocketContext } from "../contexts/SocketContext";

const Upload = ({ children, ...props }) => {
  const [files, setFiles] = useState([]);

  const { socket, handlerDispatch } = useContext(SocketContext);
  const clearFiles = useCallback(
    response => {
      console.log({ response });
      const { filename } = response;
      setFiles([...files].filter(file => file.name !== filename));
    },
    [files]
  );
  const upload = useRef(response => clearFiles(response));
  useEffect(() => {
    handlerDispatch({ type: "onUpload", payload: upload });
  }, [handlerDispatch]);

  const onDrop = useCallback(
    f => {
      let fileList = [...files];
      for (let i = 0; i < f.length; i++) {
        if (!f[i].name) return;
        fileList.push(f[i]);
      }

      setFiles(fileList);
    },
    [files, setFiles]
  );

  const onInputChange = e => {
    const { files } = e.currentTarget;
    if (files && Boolean(files.length)) {
      onDrop(files);
      e.currentTarget.value = null;
    }
  };

  const onUpload = e => {
    console.log({ submit: files, socket });
    if (socket) {
      files.forEach(file => {
        socket.emit("upload", { file, filename: file.name });
      });
    }
  };

  const { isDragging, dropProps } = useDropzone(onDrop);

  if (!Boolean(files.length)) {
    return (
      <Card className="Upload-Empty" {...dropProps}>
        <input
          id="contained-button-file"
          multiple
          type="file"
          hidden
          onChange={onInputChange}
        />
        <CardActionArea
          component="label"
          htmlFor="contained-button-file"
          className="Upload-Content-Wrapper"
        >
          <div className="Upload-Content">
            <Typography
              variant="h6"
              align="center"
              color={isDragging ? "textPrimary" : "textSecondary"}
            >
              Drag Files Here
            </Typography>
            <Typography align="center" color="textSecondary">
              or
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary">
              Click Here
            </Typography>
          </div>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card className="Upload-Filled" {...dropProps}>
      <input
        id="contained-button-file"
        multiple
        type="file"
        hidden
        onChange={onInputChange}
      />
      <CardContent>
        {files.map((file, index) => {
          // Handle Icons

          return (
            <Chip
              label={file.name}
              icon={<FileCopy />}
              onDelete={() => {
                let fileList = [...files];
                fileList.splice(index, 1);
                setFiles(fileList);
              }}
              className="m-1"
              key={`${file.name}-${index}`}
            />
          );
        })}
        <IconButton
          component="label"
          htmlFor="contained-button-file"
          size="small"
          className="m-1"
        >
          <Add />
        </IconButton>
      </CardContent>
      <CardActions className="Upload-Actions">
        <span className="ml-auto" />
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setFiles([])}
        >
          Clear
        </Button>
        <Button variant="outlined" color="primary" onClick={onUpload}>
          Upload
        </Button>
      </CardActions>
    </Card>
  );
};

export default Upload;
