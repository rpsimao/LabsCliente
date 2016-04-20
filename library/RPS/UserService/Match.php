<?php

class RPS_UserService_Match extends RPS_Config_DB_Authentication
{
    /**
     * Inicializa a ligação à base de dados e define o nome das tabelas
     * @return Zend_Db_table
     */
    protected $table;

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

    protected $username;
 
    
    
    public function __construct() {
    	parent::__construct();
    	
    	$this->table = new MatchTable();
    }
    
    
    
    public function setUsername($username)
    {
        $this->username = $username;
    }
    
    
    public function getUsername()
    {
        return $this->username;
    }
    
    
    public function labName()
    {
        $sql = $this->table->select();
        $sql->where('user =?', $this->getUsername());
        $rows = $this->table->fetchRow($sql);
        return $rows;
        
    }
    
}
?>