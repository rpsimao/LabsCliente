<?php

class RPS_Authenticate_Labs
{

    /**
     * Define o nome do laboratório
     * @var string
     */
    protected $labName;

    /**
     * Define o laboratório
     * @param string $labName
     */
    public function setLabName ($labName)
    {

        $this->labName = $labName;
    }

    /**
     * Getter nome do Laboratório
     */
    public function getLabName ()
    {

        return $this->labName;
    }

    private function getUserLogged ()
    {

        if (! Zend_Auth::getInstance()->hasIdentity()) {
            $this->_redirect('/');
        }
        $this->authUser = Zend_Auth::getInstance()->getIdentity();
        $username = $this->authUser->username;
        return $username;
    }

    private function getLabLogged ()
    {

        $userMatch = new RPS_UserService_Match();
        $userMatch->setUsername($this->getUserLogged());
        $labOptimus = $userMatch->labName();
        return $labOptimus['lab'];
    }

    /**
     * Baseado no nome do Laboratório redireciona para o controlador apropriado
     */
    public function redirectController ()
    {

        //header('Location:/' . $this->getLabLogged() . '/registos');
        header('Location:/lab/producao');
    }
}


