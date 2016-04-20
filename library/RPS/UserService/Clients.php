<?php
/**
 * Classe para autenticação
 * @author rpsimao
 *
 */
class RPS_UserService_Clients
{

    /**
     * Autentica username/password
     * @param array $credentials
     */
    public function authenticate(array $credentials)
    {
        $filterValues = new Zend_Filter_StripTags();
        $username = $filterValues->filter($credentials['username']);
        $password = $filterValues->filter($credentials['password']);
        //Define qual o nome da tabela de autenticação, e os campos de nome e palavra passe
        //Dependente do enviorment
        
        $authAdapter = new RPS_Authenticate_Login('clients', 'username', 'password');
        
        //Define as credenciais de autenticação
        $authAdapter->setCredentials($username, $password);
        //Apanha os dados de autenticação
        $params = $authAdapter->getAuthenticationParameters();
        //Compara os dados de autenticação da base de dados com os inseridos pelo utilizador
        $auth = Zend_Auth::getInstance();
        $result = $auth->authenticate($params);
        //Se o resultado for válido, escreve em memória os dados do utilizador, EXCEPTO a password
        switch ($result->getCode()) {
            //Utilizador inexistente
            case Zend_Auth_Result::FAILURE_IDENTITY_NOT_FOUND:
                $newmsg = new RPS_Helpers_Messages();
                $newmsg->setMessageType('error');
                $newmsg->setMessage('Utilizador inexistente');
                echo $newmsg->displayMessage();
                break;
            //Bad password
            case Zend_Auth_Result::FAILURE_CREDENTIAL_INVALID:
                $newmsg = new RPS_Helpers_Messages();
                $newmsg->setMessageType('error');
                $newmsg->setMessage('A password não é válida.');
                echo $newmsg->displayMessage();
                break;
            //Autenticado redireciona para o controlador do laboratório
            case Zend_Auth_Result::SUCCESS:
                $data = $params->getResultRowObject(NULL, 'password');
                $auth->getStorage()->write($data);
                $redirector = new RPS_Authenticate_Labs();
                $redirector->setLabName($username);
                $redirector->redirectController();
                break;
        }
    }

    private function getEnv()
    {
        $application = new Zend_Application();
        $bootstrap = $application->getBootstrap();
        $env = $bootstrap->getEnvironment();
        return $env;
    }
}