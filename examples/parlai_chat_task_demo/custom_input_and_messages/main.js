/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import ReactDOM from "react-dom";
import "bootstrap-chat/styles.css";
import { FormGroup, FormControl, Button, Radio } from "react-bootstrap";
import { ChatApp, DefaultTaskDescription, INPUT_MODE } from "bootstrap-chat";
import rec_list from "/home/mawenchang/Mephisto/examples/parlai_chat_task_demo/custom_input_and_messages/data.js";

/*
This example modifies the default parlai_chat example to demonstrate
how one can override the default visual implementations for the
chat message bubble and the response input bar, while coordinating
behavior between them with global state.

In this example we add a radio button group to each received chat message.
Additionally, we require the user to make a selection for the most
recently received chat message, before they can submit their own message
by modifying the input bar code.

This example is for illustrative purposes only and has not been tested
with production usage.
*/


function ChatMessage({ isSelf, idx, agentName, message = "", onRadioChange }) {
  const floatToSide = isSelf ? "right" : "left";
  const alertStyle = isSelf ? "alert-info" : "alert-warning";

  const handleChange = (e) => {
    onRadioChange(e.currentTarget.value, e.currentTarget.name);
  };

  
  return (
    <div className="row" style={{ marginLeft: "0", marginRight: "0" }}>
      <div
        className={"alert message " + alertStyle}
        role="alert"
        style={{ float: floatToSide }}
      >
        <span style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
          <b>{agentName}</b>: {message}
        </span>
        {isSelf ? null : (
          <FormGroup>
            <Radio
              name={"radio" + idx}
              value={"Pos"}
              onChange={handleChange}
            >
              Positive
            </Radio>{" "}
            <Radio
              name={"radio" + idx}
              value={"Neg"}
              onChange={handleChange}
            >
              Negative
            </Radio>{" "}

            <Radio
              name={"radio" + idx}
              value={"None"}
              onChange={handleChange}
            >
              None
            </Radio>{" "}
          </FormGroup>
        )}
      </div>
    </div>
  );
}

function RenderChatMessage({
  message,
  mephistoContext,
  appContext,
  idx,
  onRadioChange,
}) {
  const { agentId } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;

  return (
    <div>
      <ChatMessage
        idx={idx}
        isSelf={message.id === agentId || message.id in currentAgentNames}
        agentName={
          message.id in currentAgentNames
            ? currentAgentNames[message.id]
            : message.id
        }
        message={message.text}
        taskData={message.task_data}
        messageId={message.message_id}
        onRadioChange={onRadioChange}
      />
    </div>
  );
}

function displayDate(){
	document.getElementById("demo").innerHTML=Date();
}

function MainApp() {
  const [messages, setMessages] = React.useState([]);
  const [chatAnnotations, setChatAnnotation] = React.useReducer(
    (state, action) => {
      return { ...state, ...{ [action.index]: [action.value, action.movidx]} };
    },
    {}
  );

  const [turnMovies, setTurnMovies] = React.useReducer((state,action)=>{
    var tmp= [...state];
    if(action.idx==tmp.length)
    {
      tmp.push([]);
    }
    tmp[action.idx-1].push(action.name);
    return tmp;
  },[]);

  const lastMessageAnnotation = chatAnnotations[messages.length - 1];

  const getSearchResult = React.useCallback(() => {
    var show =document.getElementById('show');
    var val = document.getElementById('val');
    show.style.display = 'block';

    var str = '';
    for(let i = 0; i < rec_list.length; i++)
    {
        if(rec_list[i].indexOf(val.value) != -1)
        {
          // alert(array[i])
          str += "<li>"+rec_list[i]+"</li>";
        }
            

    }
    if(!val.value || !str)
        show.innerHTML = "<ul><li>no movie found...</li></ul>";
    else
        show.innerHTML = "<ul>"+str+"</ul>";

    var arrayList = show.getElementsByTagName("li");
    for(let i = 0; i < arrayList.length; i++)
    {
        arrayList[i].addEventListener('click',function(){
            alert(arrayList[i].innerText)
        });
    }   
  }, []);

  const onBlurEffect = React.useCallback(() => {
    var val = document.getElementById('val');
    var show = document.getElementById('show');
    var t = 5;
    setInterval(()=>{
        t--;
        if(t==0)
        {
            show.style.display = 'none';
            val.value = "";
        }
    },(1000))
  },[])

  return (
    <ChatApp
      onMessagesChange={(messages) => {
        setMessages(messages);
      }}
      /*
        You can also use renderTextResponse below, which allows you
        to modify the input bar while keeping additional default
        functionality such as the ability to trigger custom forms
        and a done state.
        Or you can use renderResponse for more flexibility and implement
        those states yourself, as shown below with the done state:
      */
      renderResponse={({ onMessageSend, inputMode, appContext }) =>
        inputMode === INPUT_MODE.DONE ? (
          <div className="response-type-module">
            <div className="response-bar">
              <h3>Thanks for completing the task!</h3>
              <button
                id="done-button"
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => appContext.onTaskComplete()}
              >
                <span
                  className="glyphicon glyphicon-ok-circle"
                  aria-hidden="true"
                />{" "}
                Done with this HIT
              </button>
            </div>
          </div>
        ) : (
          <CustomTextResponse
            onMessageSend={onMessageSend}
            active={inputMode === INPUT_MODE.READY_FOR_INPUT}
            messages={messages}
            key={lastMessageAnnotation}
            isLastMessageAnnotated={
              messages.length === 0 || lastMessageAnnotation !== undefined
            }
            lastMessageAnnotation={lastMessageAnnotation}
          />
        )
      }
      renderMessage={({ message, idx, mephistoContext, appContext }) => (
        <RenderChatMessage
          message={message}
          mephistoContext={mephistoContext}
          appContext={appContext}
          idx={idx}
          key={message.message_id + "-" + idx}
          onRadioChange={(val,mov) => {
            setChatAnnotation({ index: idx, value: val, movidx: mov});
          }}
        />
      )}
      renderSidePane={({ mephistoContext: { taskConfig } }) => (
        <DefaultTaskDescription
          chatTitle={taskConfig.chat_title}
          taskDescriptionHtml={taskConfig.task_description}
        >

        <p>Search and select the movies to recommend here:</p>

        <style>
          {`
              ul{
                list-style: none;
                margin:0px;
                padding:0px;
              }
              li{
                border:black 1px solid;
                width:250px;
                margin:0px;
                padding:0px;
              }
              input{
                width:250px;
              }`
          }
        </style>
        <div className="box" style={{zIndex:100,backgroundColor:'white',position:'absolute'}}>
          <div className="search">
            <input type="text"
            id="val"
            placeholder="Search movies to recommend..." 
            onKeyUp={()=>getSearchResult()}
            onBlur={()=>onBlurEffect()}/>           
          </div>
          <div className="show" id = "show">
          </div>
        </div>
        </DefaultTaskDescription>
      )
      
      }
    />
  );
}

function CustomTextResponse({
  onMessageSend,
  active,
  isLastMessageAnnotated,
  lastMessageAnnotation,
}) {
  const [textValue, setTextValue] = React.useState(
    !lastMessageAnnotation? "" : lastMessageAnnotation[0] + " - " +  lastMessageAnnotation[1]
  );
  const [sending, setSending] = React.useState(false);

  const annotationNeeded = active && !isLastMessageAnnotated;
  active = active && isLastMessageAnnotated;

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (active && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, [active]);

  const tryMessageSend = React.useCallback(() => {
    if (textValue !== "" && active && !sending) {
      setSending(true);
      onMessageSend({ text: textValue, task_data: {} }).then(() => {
        setTextValue("");
        setSending(false);
      });
    }
  }, [textValue, active, sending, onMessageSend]);

  const handleKeyPress = React.useCallback(
    (e) => {
      if (e.key === "Enter") {
        tryMessageSend();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
    },
    [tryMessageSend]
  );

  return (
    <div className="response-type-module">
      <div className="response-bar">
        <FormControl
          type="text"
          className="response-text-input"
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          value={textValue}
          placeholder={
            annotationNeeded
              ? "Please annotate the last message before you can continue"
              : "Enter your message here..."
          }
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => setTextValue(e.target.value)}
          disabled={!active || sending}
        />
        <Button
          className="btn btn-primary submit-response"
          id="id_send_msg_button"
          disabled={textValue === "" || !active || sending}
          onClick={() => tryMessageSend()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

ReactDOM.render(<MainApp />, document.getElementById("app"));
