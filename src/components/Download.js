import React, {
  useState,
  useContext,
  useCallback,
  useRef,
  useEffect
} from "react";
import { Card, CardContent, Chip } from "@material-ui/core";
import { SocketContext } from "../contexts/SocketContext";

const Download = props => {
  const [files, setFiles] = useState([]);

  const { handlerDispatch } = useContext(SocketContext);
  const onUpload = useCallback(
    response => {
      console.log({ response });
      setFiles([...files, response]);
    },
    [files]
  );
  const upload = useRef(response => onUpload(response));

  useEffect(() => {
    upload.current = onUpload;
  }, [onUpload]);

  useEffect(() => {
    handlerDispatch({ type: "onUpload", payload: upload });
  }, [handlerDispatch]);

  return (
    <Card className="Download">
      <CardContent>
        {files.map(file => {
          return <Chip label={file.filename} className="m-1" />;
        })}
      </CardContent>
    </Card>
  );
};

export default Download;
