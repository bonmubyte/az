import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    background-color: #fafafa;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica;
    skype bhi kh
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica;
  }

  #app {
    background-color: #fafafa;
    min-height: 100vh;
    min-width: 100%;
  }
  .container{
    width:85%;
    margin: 30px auto;
  }
  .bg-white{
    background: white;
    padding:20px;
    .view-sentences{
      padding: 10px;
      border:1px solid #eee;
      min-height: 100px;
      color: #6b6b6b;
    }
  }
  .danger-btn{
    background:red;
    color:white;
    margin-top:20px;
    border-color:red;
  }
  .primary-btn{
    background:#9e419b;
    color:#9e419b;
    margin-top:20px;
    padding:6px 12px;
    border-radius: 4px;
    border-color:#9e419b;
    :hover{
      color: white
    }
  }
 textarea{
   border: 1px solid #eee;
   width: 100%;
   padding: 8px
 }
 .danger-btn{
   background:red;
   color:white;
   margin-top:20px;
 }
  p {
    color: #999
  }
  .comments{
    text-align:left;
    p{
      color: #555;
      margin: 15px 0 !important;
    }
  }
  .logo-header{
    float:left;
    color:#555;
    font-weight:bold;
    padding-left:20px;
  }
  .ant-alert{
    margin-bottom: 30px;
  }
  .content{
    margin: 24px 16px;
    padding: 24px;
    background: #fff;
  }
  .btn-success{
    background:#4CAF50;
    border-color: #4CAF50;
    :hover,:focus{
    background:#449d48;
    border-color: #449d48;

    }
  }
  /* Header */
  .sidebar .logo {
    text-align:center;
    img{
      width:50%;
      margin-bottom:30px;
    }
  }
  /* Login Page */
  .wrapper{
    text-align:center;
    padding-top:100px;
    .logo{
      margin:30px auto;
      font-size:50px;
    }
    h3{
      font-size:20px;
    }
    .login-form {
      max-width: 100%;
      margin-top:30px;
      input{
        background:transparent;
        :hover, :focus{
          border:1px solid #ccc7c7 !important;
          box-shadow:none;
        }
      }
      .login-form-forgot {
        text-align: right;
        margin-top:10px;
      }
      .go-back {
        text-align: left;
        margin-top:10px;
      }
      .login-form-button {
        width: 100%;
        .anticon svg{
          margin-top:-8px;
          margin-left:10px;
          color:white;
        }
      }
      .signup-btn{
        margin-top:25px;
      }
      .signup{
        margin-top:30px;
      }
      .content-divider {
        text-align: center;
        display:block;
        position: relative;
        z-index: 1;
        span {
          background-color: #eeeded;
          display: inline-block;
          padding: 1px 16px;
          line-height:18px;
          color: #999999;
          :before{
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            height: 1px;
            background-color: #ddd;
            width: 100%;
            z-index: -1;
          }
        }
      }
    }
  }
  .first-mode {
    display: flex;
    justify-content: space-between;
  }
  .first-mode h5{
      font-size: 18px;
    font-weight: 600;
  }

  
  /* View Page */
  .reaction-sidebar{
    .react-box{
      min-height: 180px;
    p{
      min-height: 50px;
    }
    }
    .reaction-icons{
      font-size:50px;
      :hover{
        font-size:52px;
      }
    }
  }

  .icons-row .reaction-icons{
      font-size:50px;
      :hover{
        font-size:52px;
      }
    }

  /* News page */

  .avatar-uploader {
    .ant-upload{
      border-radius:50%;
      margin:auto auto 10px auto;
      i{
        font-size:25px;
      }
    }
    .ant-upload {
      width: 128px;
      height: 128px;
    }
    img{
      width: 128px;
      height: 128px;
      border-radius:50%;
    }
  }
  .news-box{
    margin-bottom:  50px ;

  }
  footer{
    background: #fff;
    color: #8c8c8c;
    text-align: center;
    padding: 20px 0;
  }
     .details-container{
            overflow: hidden;
        }
        .info-block{
text-align: left;
color: black;
            padding: 0 10px;
        }
        .info-block img{
margin-top: 0px;
}
        .info-block .holder{
            overflow: hidden;
    padding: 10px 0;
        }
        .info-block .holder .img-holder{
margin: 10px auto;
            max-width:150px;
        }
        .info-block .holder .img-holder img{
            width: 100%;
    margin: 0;


            height: 200px;
            display: block;
        }
 
        .info-block .holder p{
color: black;
margin: 0 0 10px;}
        .blocks-holder{
            overflow: hidden;
        }
        .block{

            position: relative;
            overflow: hidden;
            padding: 0 20px;
            margin: 0 0 20px;
        }
        .block .holder{
            overflow: hidden;
            padding: 10px;
            background: #29a5f8;
            border-radius: 10px;
            color: white;
        }
        .block .holder p{
color: white;
margin: 0 0 10px;

}
        .block:before{
            left: 8px;
            top: 50%;
            border: solid transparent;
            content: " ";
            height: 0;
            width: 0;
            position: absolute;
            pointer-events: none;
            border-color: rgba(136, 183, 213, 0);
            border-right-color: #29a5f8;
            border-width: 20px;
            margin-top: -20px;
            transform: rotate(225deg);
        }
        .block.danger .holder{
            background: #fb9691;
        }
        .block.danger:before{
            left: auto;
            right: 8px;
            transform: rotate(-45deg);
            border-right-color: #fb9691;
        }
        .custom-row,
        .custom-col{
          display:inline-block;
          vertical-align:top;
          width: inherit;
          float: none;
        }
        .custom-row img,
        .custom-col img{
          max-width: 100%;
          display: block;
        }
        .reaction-sidebar > .custom-row{width: 48%;}
        .reaction-sidebar > .custom-row > .custom-col > .custom-row{width: 50%;}
        .reaction-sidebar > .custom-row > .custom-col > .custom-row > .custom-col,
        .reaction-sidebar > .custom-row > .custom-col{width: 100%;}
`;

export default GlobalStyle;
