<?php

class RPS_UserService_Optimus extends RPS_Config_DB_Optimus
{

    /**
     * Inicializa a ligação à base de dados e define o nome das tabelas
     * @return Zend_Db_table
     */
    protected $labName;

    /**
     * 
     * @var string
     */
    protected $sql;

    /**
     * 
     * @var string
     */
    protected $rows;

    /**
     * 
     * @var string
     */
    protected $date;

    /**
     * Construct
     * Define as tabelas
     */
    function __construct ()
    {

        parent::__construct();
        $this->job = new JobTable();
        $this->jtx = new JtxTable();
        $this->del = new DelTable();
        $this->tm = new TmTable();
        $this->staff = new StafTable();
        $this->act = new ActTable();
    }

    /**
     * Setter nome do lab
     * @param string $labName
     */
    public function setLabName ($labName)
    {

        $this->labName = $labName;
    }

    /**
     * Getter nome do Lab
     */
    public function getLabName ()
    {

        return $this->labName;
    }

    /**
     * Procura por ano corrente todos os trabalhos de um lab
     */
    public function getJobsYearly ()
    {

        $date = date(Zend_Date::YEAR_8601) . "-01-01";
        $sql = $this->job->select();
        $sql->where("j_customer =?", $this->labName);
        $sql->where("j_datein >= ?", $date);
        $sql->where("`j_qty_ordered` != 1");
        $sql->where("`j_qty_ordered` != 0");
        $sql->order("j_deldate DESC");
        $rows = $this->job->fetchAll($sql);
        return $rows;
    }

    public function getLabNameByJobNumber ($jobNumber)
    {

        $sql = $this->job->select();
        $sql->where("j_number = ?", $jobNumber);
        $rows = $this->job->fetchRow($sql);
        return $rows;
    }

    /**
     * Função genérica para queries
     * @param string $query
     * @return array
     */
    public function genericQuery ($query)
    {

        $row = $this->job->getAdapter()->fetchRow($query);
        return $row;
    }

    public function getDeliveries ($job)
    {

        $sql = $this->del->select();
        $sql->where('del_job = ?', $job);
        $sql->where('del_ad_parent = 0');
        //$sql->order('del_scheduled');
        $rows = $this->del->fetchAll($sql);
        return $rows;
    }

    public function getLastDeliveries ($job)
    {

        $sql = $this->del->select();
        $sql->where('del_job = ?', $job);
        $sql->where('del_ad_parent = 0');
        $sql->order('del_scheduled DESC LIMIT 1');
        $rows = $this->del->fetchRow($sql);
        return $rows;
    }

    public function getAllStagesOfJob ($job)
    {

        $sql = $this->tm->select();
        $sql->where('tm_job = ?', $job);
        $sql->order('tm_start');
        $rows = $this->tm->fetchAll($sql);
        return $rows;
    }

    public function machineToHuman ($code)
    {
        $code = ($code == "") ? "001" : $code;
        
        $sql = $this->act->select('act_name');
        $sql->where('act_code = ?', $code);
        $row = $this->act->fetchRow($sql);
        return $row;
    }

    /**
     * Retorna valores do cliente e os dois titulos do trabalho da folha de obra baseados no numero da obra
     * @param int $numObra
     * @return array
     */
    public function getJobData ($numObra)
    {

        $sql = $this->job->select('j_customer', 'j_title1', 'j_title2')->where('j_number = ?', $numObra);
        $row = $this->job->fetchRow($sql);
        return $row;
    }

    public function getAllFromJobTableProducaoByLab ($labName)
    {

       /* $row = $this->job->getAdapter()->fetchAll("SELECT * FROM  `job` WHERE  `j_datein` >=  '2009-01-01' AND `j_type` like '06%' AND `j_status` = 10 OR `j_status` = 0 AND `j_qty_ordered` != 1 AND `j_qty_ordered` != 0 order by 'j_deldate' ASC");
        return $row;*/
        $sql = $this->job->select();
        $sql->where('j_customer =?', $labName);
        $sql->where("`j_datein` >=  '2009-01-01'");
        $sql->where("`j_type` like '06%'");
        $sql->where("`j_status` = ?", 10);
        /*$sql->orWhere("`j_status` = ?", 0);*/
        $sql->where("`j_qty_ordered` != 1");
        $sql->where("`j_qty_ordered` != 0");
        $sql->order('j_deldate');
        $row = $this->job->fetchAll($sql);
        return $row;
    }

    public function getAllFromJobTableProducaoTodayByLab ($labName)
    {

        $today = date('Y-m-d');
        $row = $this->job->getAdapter()->fetchAll("SELECT * FROM  `job` WHERE  `j_datein` >=  '2009-01-01' AND `j_type` like '06%' AND `j_status` = 10 AND `j_deldate` = '$today' AND `j_qty_ordered` != 1 AND `j_qty_ordered` != 0 order by 'j_number' DESC");
        return $row;
    }

    public function getAllFromJobTableProducaoTomorrowByLab ($labName)
    {

        if (date('l') == 'Friday') {
            $today = new Zend_Date();
            $dayT = $today->add('3', Zend_Date::DAY);
            $tomorrow = date('Y') . '-' . RPS_Helpers_ChangeMonth::changeMonth($dayT) . '-' . $dayT;
        } else {
            $today = new Zend_Date();
            $dayT = $today->add('1', Zend_Date::DAY);
            $tomorrow = date('Y') . '-' . RPS_Helpers_ChangeMonth::changeMonth($dayT) . '-' . $dayT;
        }
        $row = $this->job->getAdapter()->fetchAll("SELECT * FROM  `job` WHERE  `j_datein` >=  '2009-01-01' AND `j_type` like '06%' AND `j_status` != 40 AND `j_deldate` = '$tomorrow' AND `j_qty_ordered` != 1 AND `j_qty_ordered` != 0 order by 'j_number' DESC");
        return $row;
    }

    public function getJobNumberToDeliveryTodayByLab ($labName)
    {

        $today = date('Y-m-d');
        $sql = $this->job->select();
        $sql->where('j_customer = ?', $labName);
        $sql->where('j_deldate = ?', $today);
        $sql->where("j_type like '06%'");
        $sql->where("j_status != 40");
        $sql->where("j_qty_ordered != ?", 1);
        $sql->where("j_qty_ordered != ?", 0);
        $sql->order("j_number DESC");
        $rows = $this->job->fetchAll($sql);
        return $rows;
    }

    public function getStateOfJob ($job)
    {
        $job = ($job == "") ? "001" : $job;
        
        $sql = $this->tm->select('tm_act');
        $sql->where('tm_job = ?', $job);
        $sql->order('tm_end DESC');
        $row = $this->tm->fetchRow($sql);
        return $row;
    }

    public function getAllFromJobTableEntreguesByLab ($labName)
    {

        $date = $this->months();
       /* $row = $this->job
                    ->getAdapter()
                    ->fetchAll("SELECT * FROM  `job` WHERE `j_customer` = '$labName' AND `j_type` like '06%' AND `j_status` = 20  OR `j_status` = 40 OR `j_status` = 30 AND `j_deldate` BETWEEN  '$date[0]' AND '$date[1]' order by 'j_number' DESC");
        return $row;*/
        $sql = $this->job->select();
        $sql->where('j_customer = ?', $labName);
        $sql->where("j_type like '06%'");
        $sql->where("j_status >= 20");
        $sql->where("`j_deldate` BETWEEN  '$date[0]' AND '$date[1]'");
        $sql->order("j_deldate");
        $rows = $this->job->fetchAll($sql);
        return $rows;
    }
    
    
    public function getJobsInProvas($labName)
    {
        $sql = $this->job->select();
        $sql->where("`j_type` like '12%'");
        $sql->where('`j_customer` = ?', $labName);
        $sql->where("`j_status` = 10");
        $rows = $this->job->fetchAll($sql);
        return $rows;
        
        
    }

    public function getAllStatsOfJob ($numObra)
    {

        $sql = $this->job->select();
        $sql->where('j_number =?', $numObra);
        $rows = $this->job->fetchRow($sql);
        return $rows;
    }

    private function months ()
    {

        $date = getdate();
        $year = $date['year'];
        switch ($date['mon']) {
            case 1:
                $sql = array(
                    "$year-01-01" , 
                    "$year-01-31");
                return $sql;
                break;
            case 2:
                $sql = array(
                    "$year-02-01" , 
                    "$year-02-29");
                return $sql;
                break;
            case 3:
                $sql = array(
                    "$year-03-01" , 
                    "$year-03-31");
                return $sql;
                break;
            case 4:
                $sql = array(
                    "$year-04-01" , 
                    "$year-04-30");
                return $sql;
                break;
            case 5:
                $sql = array(
                    "$year-05-01" , 
                    "$year-05-31");
                return $sql;
                break;
            case 6:
                $sql = array(
                    "$year-06-01" , 
                    "$year-06-30");
                return $sql;
                break;
            case 7:
                $sql = array(
                    "$year-07-01" , 
                    "$year-07-31");
                return $sql;
                break;
            case 8:
                $sql = array(
                    "$year-08-01" , 
                    "$year-08-31");
                return $sql;
                break;
            case 9:
                $sql = array(
                    "$year-09-01" , 
                    "$year-09-30");
                return $sql;
                break;
            case 10:
                $sql = array(
                    "$year-10-01" , 
                    "$year-10-31");
                return $sql;
                break;
            case 11:
                $sql = array(
                    "$year-11-01" , 
                    "$year-11-30");
                return $sql;
                break;
            case 12:
                $sql = array(
                    "$year-12-01" , 
                    "$year-12-31");
                return $sql;
                break;
        }
    }
}
?>