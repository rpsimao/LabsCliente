<?php
class LabController extends Zend_Controller_Action
{

    public function init()
    {
        if (! Zend_Auth::getInstance()->hasIdentity()) {
            $this->_redirect('/');
        }
        $this->authUser = Zend_Auth::getInstance()->getIdentity();
        $username = $this->authUser->username;
        $acl = new RPS_Autorization_User();
        $acl->setUsername($username);
        if ($acl->check() == FALSE) {
            $this->_redirect('/noauth');
        }
        //
        $user = new RPS_UserService_Authentication();
        $user->setUsername($username);
        $this->view->id = $user->getUserIdRow();
        //
        $userMatch = new RPS_UserService_Match();
        $userMatch->setUsername($username);
        $this->labOptimus = $userMatch->labName();
    }

    public function preDispatch()
    {
        $this->optimus = new RPS_UserService_Optimus();
        $this->view->optimus = new RPS_UserService_Optimus();
        $this->optimus->setLabName($this->labOptimus['laboptimus']);
        $this->view->obras = new RPS_UserService_Obras();
        $this->provas = new RPS_UserService_Emprova();
        //
        $jobsProducao = $this->optimus->getAllFromJobTableProducaoByLab($this->labOptimus['laboptimus']);
        $this->view->totalProducao = count($jobsProducao);
        //
        $registosProvas = $this->optimus->getJobsInProvas($this->labOptimus['laboptimus']);
        $this->view->totalProvas = count($registosProvas);
        //
        $jobsEntregues = $this->optimus->getAllFromJobTableEntreguesByLab($this->labOptimus['laboptimus']);
        $this->view->totalEntregas = count($jobsEntregues);
        //
        $registos = $this->optimus->getJobsYearly();
        $this->view->totalRegistos = count($registos);
    }

    public function indexAction(){}

    public function registosAction()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        $page = $this->_getParam('page', 1);
        $registos = $this->optimus->getJobsYearly();
        //
        $paginatorRegistos = Zend_Paginator::factory($registos);
        $paginatorRegistos->setItemCountPerPage(8);
        $paginatorRegistos->setCurrentPageNumber($page);
        $this->view->registos = $paginatorRegistos;
    }

    public function provasAction()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        $page = $this->_getParam('page', 1);
        $registos = $this->optimus->getJobsInProvas($this->labOptimus['laboptimus']);
        $this->view->total = count($registos);
        $paginatorRegistos = Zend_Paginator::factory($registos);
        $paginatorRegistos->setItemCountPerPage(8);
        $paginatorRegistos->setCurrentPageNumber($page);
        $this->view->registos = $paginatorRegistos;
    }

    public function producaoAction()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        $jobsProducao = $this->optimus->getAllFromJobTableProducaoByLab($this->labOptimus['laboptimus']);
        $this->view->total = count($jobsProducao);
        $page = $this->_getParam('page', 1);
        $paginatorJob = Zend_Paginator::factory($jobsProducao);
        $paginatorJob->setItemCountPerPage(8);
        $paginatorJob->setCurrentPageNumber($page);
        $this->view->jobProducao = $paginatorJob;
    }

    public function entregasAction()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        $jobsEntregues = $this->optimus->getAllFromJobTableEntreguesByLab($this->labOptimus['laboptimus']);
        $page = $this->_getParam('page', 1);
        $paginatorJob = Zend_Paginator::factory($jobsEntregues);
        $paginatorJob->setItemCountPerPage(8);
        $paginatorJob->setCurrentPageNumber($page);
        $this->view->jobEntregues = $paginatorJob;
    }
}