import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,useRoutes} from 'react-router-dom';
import {AuthContext} from '/src/contexts/AuthContext.jsx';
import {MainLayout} from '/src/layouts/MainLayout/MainLayout.jsx';
import {StudentWelcomePage} from '/src/pages/StudentWelcome/StudentWelcomePage.jsx';
import {CreateCoursePage} from '/src/pages/Courses/CreateCoursePage.jsx';
import '/src/index.css';
import '/src/pages/Home/home.css';
const screen=new URLSearchParams(location.search).get('screen');
const user={id:'theme-preview-fixture',role:screen==='create-course'?'teacher':'student',name:'Kiểm tra giao diện',phone:'',qualifications:'Bằng cấp mẫu',experience:'Thông tin mẫu',bio:'Thông tin kiểm tra bố cục'};
function Preview(){return useRoutes([{element:<MainLayout/>,children:[{path:'/',element:screen==='create-course'?<CreateCoursePage/>:<StudentWelcomePage/>}]}]);}
createRoot(document.getElementById('root')).render(<AuthContext.Provider value={{user,isAuthenticated:true,loading:false}}><MemoryRouter><Preview/></MemoryRouter></AuthContext.Provider>);
