<?php
class RPS_UserService_Authentication extends RPS_Config_DB_Authentication
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
    protected $id;

    /**
     * Construct
     * Define as tabelas
     */
    function __construct()
    {
        parent::__construct();
        $this->table = new ClientsTable();
    }

    public function setUsername($username)
    {
        $this->username = $username;
    }

    public function getUsername()
    {
        return $this->username;
    }

    public function setID($id)
    {
        $this->id = $id;
    }

    public function getID()
    {
        return $this->id;
    }

    public function getUserIdRow()
    {
        $sql = $this->table->select('id');
        $sql->where('username = ?', $this->getUsername());
        $rows = $this->table->fetchRow($sql);
        return $rows;
    }

    public function getUsernameRow()
    {
        $sql = $this->table->select('username');
        $sql->where('id = ?', $this->getID());
        $rows = $this->table->fetchRow($sql);
        return $rows;
    }
}
?>