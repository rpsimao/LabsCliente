<?php

class CockpitController extends Zend_Controller_Action
{

    public function init ()
    {
        $q = new RPS_Autorization_Jobs();
        $q->setID($this->_getParam('id'));
        $q->setJobNumber($this->_getParam('job'));
        $user = $q->check();
        $job = $q->checkJobNumberAuth();
        if ($user == FALSE || $job == FALSE) {
            $this->_redirect('/noauth');
        }
    }

    public function preDispatch ()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        $this->_helper->viewRenderer('cockpit');
        $this->job = new RPS_UserService_Obras();
        $this->backstage = new RPS_UserService_Backstage();
        $this->optimus = new RPS_UserService_Optimus();
        $this->registos = new RPS_UserService_Registos();
    }

    public function indexAction ()
    {
        $numobra = $this->_getParam('job');
        
        if ($this->checkJobNumber($numobra) == 0) {
            $this->_redirect('/cockpit/error');
        } else {
            $values = $this->job->getValues((int) $numobra);
            $params = array(
                'numobra' => $numobra , 
                'cliente' => $values['cliente'] , 
                'produto' => $values['produto'] , 
                'formato' => $values['formato'] , 
                'edicao' => $values['edicao'] , 
                'cartolina' => $values['cartolina'] , 
                'espessura' => $values['espessura'] , 
                'codproduto' => $values['codproduto'] , 
                'codlaetus' => $values['codlaetus'] , 
                'codvisual' => $values['codvisual'] , 
                'codf3' => $values['codf3'] , 
                'numcores' => $values['numcores'] , 
                'vernizmaq' => $this->translateCheckboxes($values['vernizmaq']) , 
                'vernizuv' => $this->translateCheckboxes($values['vernizuv']) , 
                'braille' => $this->translateCheckboxes($values['braille']) , 
                'prova' => $values['prova']);
            $this->view->job  = $params;
            $this->view->code = substr($params['codf3'], 0, -2);
        }
        switch ($values['numcores']) {
            case ("CMYK"):
                $obraCores = array(
                    "C" , 
                    "M" , 
                    "Y" , 
                    "K");
                break;
            default:
                $obraCores = explode('+', $values['numcores']);
                break;
        }
        $sql = new RPS_UserService_Pantones();
        $allColors = array();
        foreach ($obraCores as $cores) {
            $cor = $sql->getHexColor($cores);
            $allColors[] = '<div class="box" style="background-color:' . $cor['hex'] . ';">&nbsp;</div>';
        }
        $this->view->colors = array_combine($obraCores, $allColors);
        /**
         * @var $backstageInfo unknown_type
         */
        $backstageInfo = $this->backstage->getValuesSubOrderID($numobra);
        
        if (empty($backstageInfo['Url'])) {
            $backstageInfo = $this->backstage->getValuesProjectID($numobra);
            $cleanPath = str_replace('file://fertbs1/Scope_Laboratorios/', '', $backstageInfo['Url']);
            
        }
        
        
        $cleanPath2 = str_replace('file://fertbs1/Scope_Laboratorios/', '/media/scope/', $backstageInfo['Url']);
        $this->view->cleanPath2 = $cleanPath2;
        /**
         * Generic Query Job table
         */
        $getJobParameters = $this->optimus->genericQuery("select * from `job` where `j_number` = '$numobra'");
        $this->view->jobParameters = $getJobParameters;
        /**
         * Última Entrega
         * 
         */
        $ultimaEntrega = $this->optimus->getLastDeliveries($numobra);
        $this->view->ultimaEntrega = $ultimaEntrega;
        /**
         * Produção da embalagem
         */
        $producao = $this->optimus->getAllStagesOfJob($numobra);
        
        $page = $this->_getParam('page', 1);
        $paginatorRegistos = Zend_Paginator::factory($producao);
        $paginatorRegistos->setItemCountPerPage(8);
        $paginatorRegistos->setCurrentPageNumber($page);
        $this->view->producao = $paginatorRegistos;
        /**
         * Entregas
         */
        $entregas = $this->optimus->getDeliveries($numobra);
        $this->view->entregas = $entregas;
        /**
         * Registos
         * 
         */
        if (empty($values['codf3'])) {
            $data = $this->registos->getNumObra($numobra);
            $codinterno = $this->registos->getCodInterno($data['cod_interno']);
            $this->view->qtd = $this->optimus->getAllStatsOfJob($numobra);
            $this->view->registosAnteriores = $codinterno;
        } else {
            $data = $this->registos->getCodInterno($values['codf3']);
            $this->view->qtd = $this->optimus->getAllStatsOfJob($numobra);
            $this->view->registosAnteriores = $data;
        }
        
        $this->view->registos = $this->job->getValues($numobra);
        
        $this->view->urlID = $this->_getParam('id');
        $this->view->urlJOB = $this->_getParam('job');
    }

    /**
     * 
     * Transforma Sim ou Não em 0 ou 1
     * @param string $value
     * @return int
     */
    private function translateCheckboxes ($value)
    {

        $number = ($value == 'Sim') ? 1 : 0;
        return $number;
    }

    /**
     * Transforma 0 ou 1 Sim ou Não
     * @param int $value
     * @return string
     */
    private function reverseTranslateCheckboxes ($value)
    {

        $string = ($value == 0) ? 'Não' : 'Sim';
        return $string;
    }

    /**
     * Confirma se a obra já existe na base de dados da embalagem
     * @param int $numObra
     * @return int
     */
    private function checkJobNumber ($numObra)
    {

        try {
            $check = new RPS_UserService_Obras();
            $values = $check->getValues($numObra);
            $exists = count($values);
            return $exists;
        } catch (Zend_Exception $e) {
            return 0;
        }
    }
}

