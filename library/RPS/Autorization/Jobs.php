<?php

class RPS_Autorization_Jobs
{

    const NO_AUTH = 0;

    const OK_AUTH = 1;

    protected $labName;

    private $authUser;

    protected $jobNumber;

    protected $id;

    public function setLabName ($labName)
    {

        $this->labName = $labName;
    }

    private function getLabName ()
    {

        return $this->labName;
    }

    private function setAuthUser ()
    {

        $this->authUser = Zend_Auth::getInstance()->getIdentity();
        return $this->authUser->username;
    }

    public function setJobNumber ($jobNumber)
    {

        $this->jobNumber = $jobNumber;
    }

    private function getJobNumber ()
    {

        return $this->jobNumber;
    }

    public function setID ($id)
    {

        $this->id = $id;
    }

    private function getID ()
    {

        return $this->id;
    }

    public function check ()
    {

        $table = new RPS_UserService_Authentication();
        $table->setID($this->getID());
        $_username = $table->getUsernameRow();
        if ($this->setAuthUser() != $_username['username']) {
            return self::NO_AUTH;
        } else {
            return self::OK_AUTH;
        }
    }

    private function matchLabs ()
    {

        $lab = new RPS_UserService_Match();
        $lab->setUsername($this->setAuthUser());
        $labName = $lab->labName();
        return $labName['laboptimus'];
    }

    public function checkJobNumberAuth ()
    {

        $jobs = new RPS_UserService_Optimus();
        $lab = $jobs->getLabNameByJobNumber($this->getJobNumber());
        if ($lab['j_customer'] != $this->matchLabs()) {
            return self::NO_AUTH;
        } else {
            return self::OK_AUTH;
        }
    }

  
}
?>