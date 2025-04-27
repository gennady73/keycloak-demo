import React from 'react';
import { useEffect, useState, useContext } from "react";
import { AuthContext } from '../components/Secured';

const axiosInstance = require('../interceptors/KeycloakInterceptor.js').initAxiosInstance();

const fetchResource = async (id) => {
  try {

    if (window === undefined || window.accessToken === undefined || window.idToken === undefined) {
      return { status: "success", response: ['none'] };
    }

    if (id === 'none') {
      return { status: "success", response: ['none'] };
    }

   const { data } = await axiosInstance.get("http://localhost:3002/api/" + id, {

      crossDomain: true,
      mode: 'cors',
      timeout: 10000,
      headers: {
        'Accept': '*/*'
      }
    });
    return { status: "success", response: data };
  } catch (error) {
    return { status: "failure", response: error };
  }
};

const fetchResourceM2M = async (id) => {
  try {

    if (window === undefined || window.accessToken === undefined || window.idToken === undefined) {
      return { status: "success", response: ['none'] };
    }

    if (id === 'none') {
      return { status: "success", response: ['none'] };
    }

    const { data } = await axiosInstance.get("http://localhost:3002/api/m2m/" + id, {
      crossDomain: true,
      mode: 'cors',
      timeout: 10000,
      headers: {
        'Accept': '*/*'
      }
    });
    return { status: "success", response: data };
  } catch (error) {
    return { status: "failure", response: error };
  }
};

const fetchUsersWithSA = async (id, url) => {
  try {
        
    const { data } = await axiosInstance.get(`${url}/${id}`, {
      crossDomain: true,
      mode: 'cors',
      timeout: 10000,
      headers: {
        'Accept': '*/*'
      }
    });
    return { status: "success", response: data };
  } catch (error) {
    return { status: "failure", response: error };
  }
}

const fetchUsersM2M = async (id) => {
  try {

    if (window === undefined || window.accessToken === undefined || window.idToken === undefined) {
      return { status: "success", response: ['none'] };
    }

    if (id === 'none') {
      return { status: "success", response: ['none'] };
    }

    const { data } = await axiosInstance.get("http://localhost:3002/api/m2m/" + id, {
      crossDomain: true,
      mode: 'cors',
      timeout: 30000,
      headers: {
        'Accept': '*/*'
      }
    });
   
    return { status: "success", response: data };
  } catch (error) {
   
    return { status: "failure", response: error };
  }
};


const SecuredPage = () => {
  const keycloak = useContext(AuthContext).keycloak;
  const [resourceID, setResourceID] = useState('');
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [dataM2M, setDataM2M] = useState(null);
  const [isM2M, setM2M] = useState(false);
  const [isM2MSA, setM2MSA] = useState(false);
  const [users, setUsers] = useState(null);
  const [isSA, setSA] = useState(false);
  const [usersSA, setUsersSA] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

      if (resourceID !== '') {

        console.log("1. uid %s", resourceID);
        var uid = "" + resourceID;
        console.log("2. uid %s", resourceID);
        uid = (uid && (uid.startsWith("user"))) ? uid.slice(0, uid.length - 1) : uid;
        //FIXME
        uid = (uid && (!uid.startsWith("user") && !uid.startsWith("admin"))) ? "user" : uid;
        console.log("3. uid %s", uid);

        const { status, response } = (isM2M === true)? await fetchResourceM2M(uid) : await fetchResource(uid);

        if (status === "success") {

          console.log(response);
          const data = Array.prototype.map.call([response], item => item);
          (isM2M === true)? setDataM2M(data) : setData(data);
          setError(null);
          setResourceID('');
          setM2M(false);
          setM2MSA(false);
        }
        else if (status === "failure") {

          setError("Failed to fetch data!");
          console.error(error);
          const data = Array.prototype.map.call([response.data], item => item);
          (isM2M === true)? setDataM2M(data) : setData(data);
          setResourceID('');
          setM2M(false);
          setM2MSA(false);
        }

      }

      if (isM2MSA === true) {

        try {
          const { status, response } = await fetchUsersM2M("users");
          let [_users] = [];

          if (status === "success") {
            console.log(response);
            const data = response['message']? response['message'] : response;
            _users = Array.prototype.map.call(data, item => item);
            setUsers(_users);
            setM2MSA(false);
          }
          else if (status === "failure") {

            let {error, error_msg} = getResponseErrorMessage(response);
            console.error(`fetchUsersM2M error: ${error}`);
            setUsers(error_msg);

            setM2MSA(false);
          }
        }
        catch(error) {

          setUsers(null);
          setM2MSA(false);
          console.error(`fetchUsersM2M error: ${error}`);
        };
      }

      if (isSA === true) {
        
        try {
          const { status, response } = await fetchUsersWithSA("users", "http://localhost:3005/api");
          let [_users] = [];

          if (status === "success") {

            console.log(response);
            const data = response['message']? response['message'] : response;
            _users = Array.prototype.map.call(data, item => item);
            setUsersSA(_users);
            setSA(false);
          }
          else if (status === "failure") {

            let {error, error_msg} = getResponseErrorMessage(response);
            console.error(`fetchUsersWithSA error: ${error}`);
            setUsersSA(error_msg);
            setSA(false);
          }
        }
        catch(err) {
          setUsersSA(null);
          setSA(false);
          console.log(err);
        }
      }

    };
    fetchData();
  }, [resourceID, keycloak, error, isM2M, isM2MSA, users, isSA, usersSA]);


  return (

    <div className='App-body'>
      {/* <h3>Welcome to the Protected Page.</h3> */}
      <hr></hr>

      {keycloak.authenticated && (
        <p>authenticated user: {keycloak.tokenParsed.preferred_username}</p>
      )}
      
      <div>
        <div style={{border: '1px solid'}}>
          <p> Front-End to Back-End</p>
          <div>
              <img src='./img/webapp-fe.png' className='App-img-med' alt='Workflow: Web application with Front-end' />
          </div>

          <table style={{border: '0px', minWidth: '350px', maxWidth: '100%', marginTop: '5px', marginBottom: '5px', display: 'flex', textAlign: 'left'}}>
            <tbody>
              <tr>
                  <td>
                    <div>
                      <button onClick={() => setResourceID(keycloak.tokenParsed.preferred_username)}>
                        Get user resource
                      </button>
                    </div>
                  </td>
                  <td>
                    <div>
                      <button onClick={() => setResourceID('admin')}>
                        Get admin resource
                      </button>
                    </div>
                  </td>
              </tr>            
            </tbody>
          </table>
          <table style={{border: '1px solid', minWidth: '350px', maxWidth: '100%',  display: 'flex', textAlign: 'left'}}>
            <tbody>
              <tr>
                <td colSpan={2}>
                  response from the back-end:
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  {data && data.map(item => (
                    <div>{item}</div>)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <span style={{margin:'10px'}}></span>
        
        <div style={{border: '1px solid'}}>
          <p> Machine to machine (M2M) </p>

          <div>
            <img src='./img/webapp-fe-be-m2m-dark.png' className='App-img-med-2' alt='Workflow: Machine to machine communication(M2M)' />
          </div>

          <table style={{border: '0px', minWidth: '350px', maxWidth: '100%', marginTop: '5px', marginBottom: '5px', display: 'flex', textAlign: 'left'}}>
            <tbody>
              <tr>
                  <td>
                    <div>
                      <button onClick={() => {setM2M(true); setResourceID(keycloak.tokenParsed.preferred_username)}}>
                        Get m2m resource as 'user'
                      </button>
                    </div>
                  </td>
                  <td>
                    <div>
                      <button onClick={() => {setM2M(true); setResourceID('admin');}}>
                        Get m2m resource as 'admin'
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
          </table>
          <table style={{border: '1px solid', minWidth: '350px', maxWidth: '100%',  display: 'flex', textAlign: 'left'}}>
            <tbody>
              <tr>
                <td colSpan={2}>
                  response from the back-end:
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  {dataM2M && dataM2M.map(item => (
                    <div>{item}</div>)
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{border: '1px solid', minWidth: '350px', maxWidth: '100%',  display: 'flex', textAlign: 'left'}}>
            <tbody>
            <tr>
                <td>
                    <div>
                      <button onClick={() => {setM2MSA(true);}}>
                        Get m2m resource using 'service account'
                      </button>
                    </div>
                </td>
                <td>
                    <div>
                      <button onClick={() => {setUsers(null);}}>
                        clear
                      </button>
                    </div>
                </td>
              </tr>
              <tr>
                <td>User list:</td><td></td>
              </tr>

              <tr>
                <td colSpan={2}>
                  response from the back-end:
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  {users && users.map((user) => (
                    <div>{user.username}</div>
                    ))
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <span style={{margin:'10px'}}></span>
        
        <div style={{border: '1px solid'}}>
          <p> Front-End to Back-End (use of Service Account)</p>
          <div>
            <img src='./img/webapp-fe-be-sa-dark.png' className='App-img-med-2' alt='Workflow: Machine to machine communication(M2M)' />
          </div>
          <table style={{border: '0px', minWidth: '350px', maxWidth: '100%', marginTop: '5px', marginBottom: '5px', display: 'flex', textAlign: 'left'}}>
            <tbody>
              <tr>
                <td>
                    <div>
                      <button onClick={() => {setSA(true);}}>
                        Get resource using a 'service account'
                      </button>
                    </div>
                </td>
                <td>
                    <div>
                      <button onClick={() => {setUsersSA(null);}}>
                        clear
                      </button>
                    </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table style={{border: '1px solid', minWidth: '350px', maxWidth: '100%',  display: 'flex', textAlign: 'left'}}>
            <tbody>
              <tr>
                <td>User list:</td><td></td>
              </tr>

              <tr>
                <td colSpan={2}>
                  response from the back-end:
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  {usersSA && usersSA.map((userSA) => (
                    <div>{userSA.username}</div>
                    ))
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default SecuredPage;

function getResponseErrorMessage(response) {
  let error = response['message'] ? response['message'] : response['data'] ? response['data'] : response;
  let error_msg = Array.prototype.map.call([{ username: error }], item => item);
  return { error, error_msg };
}
