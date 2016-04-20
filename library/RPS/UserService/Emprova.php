<?php

class RPS_UserService_Emprova extends RPS_Config_DB_Embalagem
{

    /**
     * Nome da Tabela
     * @var string
     */
    protected $table;

    /**
     * Nome do Laboratorio
     * @var string
     */
    protected $labName;

    /**
     * executa um pedido à base de dados
     * @var string
     */
    protected $sql;

    /**
     * Retorna os valores do pedido à base de dados
     * @var array
     */
    protected $data;

    /**
     * Liga à base de dados e define a tabela a usar
     * @return Zend_Db_Table
     */
    public function __construct ()
    {

        parent::__construct();
        $this->table = new EmprovaTable();
    }

    public function getProvasByLab ($labName)
    {

        $sql = $this->table->select();
        $sql->where('lab =?', $labName);
        $sql->where('estado != 2');
        $data = $this->table->fetchAll($sql);
        return $data;
    }
}
?>