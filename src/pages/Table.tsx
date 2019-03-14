import React, { ChangeEvent } from 'react'
import { Table, Modal } from 'antd';
import { Cell } from './Cell';
import TextArea from 'antd/lib/input/TextArea';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface TableData {
  rowIndex: number
  colIndex: number
  exp: string
  value: string
  desc: string
}
export interface TableDataMap {
  [rowIndex_colIndex: string]: TableData
}

export interface EditableTableProps {
  // 行列数
  rowNum: number
  colNum: number
}

/**
 * 可编辑的表格
 * 
 * 根据行列数、数据map绘制表格
 * 表达式变更时进行数据计算
 */
export default class EditableTable extends React.PureComponent<EditableTableProps> {
  readonly state = {
    tableDataMap: {},
    descModalVisible: false,
    descData: null,
    descValue: ''
  }

  descInput = React.createRef<TextArea>()

  constructor(props: EditableTableProps) {
    super(props)

    this.toggleDescModal = this.toggleDescModal.bind(this)
    this.handleDescChange = this.handleDescChange.bind(this)
    this.handleDescSave = this.handleDescSave.bind(this)
    this.handleExpressionChange = this.handleExpressionChange.bind(this)

    // this.getTableData = this.getTableData.bind(this)
    // this.getTableDataMap = this.getTableDataMap.bind(this)
  }

  // 列数据组装为需要格式，-1表示第一列
  getColumns() {
    const columns = []
    for (let i = -1; i < this.props.colNum; i++) {
      columns.push(this.getColumnData(i))
    }
    return columns
  }

  // 单列配置数据
  getColumnData(colIndex:number) {
    const colData: any = {
      title: '',
      width: 100,
      key: `c_${colIndex}`,
      dataIndex: colIndex,
      render: this.getCellRender(colIndex)
    }
    if (colIndex === -1) { // 额外首列
      colData.width = 40
    } else {
      const prefix: string = colIndex >= 26 ? LETTERS[Math.floor(colIndex/26) - 1] : ''
      colData.title = prefix + LETTERS[colIndex % 26]
    }
    return colData
  }

  // 表格重写
  getCellRender(colIndex: number) {
    return (text: string, record: any, rowIndex: number) => {
      if (colIndex === -1) {
        return text
      } else {
        const changeFunc = (exp: string) => this.handleExpressionChange(rowIndex, colIndex, exp)
        const descFunc = () => {
          this.toggleDescModal()
          const d: TableData = {
            ...this.getTableData(rowIndex, colIndex),
            rowIndex, colIndex
          }
          this.setState({
            descData: d,
            descValue: d.desc || ''
          })
        }
        const d: TableData = this.getTableData(rowIndex, colIndex) || {}
        return (
          <Cell
            exp={d.exp}
            value={d.value}
            editable={true}
            onExpressionChange={changeFunc}
            onDescreption={descFunc}
          />
        )
      }
    }
  }

  // 获取行数据记录
  getRows() {
    const rows= []
    for (let i = 0; i < this.props.rowNum; i++) {
      rows.push(this.getRowData(i))
    }
    return rows
  }
  getRowData(rowIndex: number) {
    const { colNum } = this.props
    const row = { key: 'r_' + rowIndex }
    for (let i = -1; i < colNum; i++) {
      if (i === -1) {
        row[i] = rowIndex + 1
      } else {
        row[i] = ''
        // 如果已有exp，需要重新计算一遍
        const d: TableData = this.getTableData(rowIndex, i)
        if (d) {
          if (d.exp && d.exp[0] === '=') {
            d.value = this.getCalculateValue(d.exp.substring(1))
          }
          row[i] = d.value || ''
        }
      }
    }
    return row;
  }

  // 表达式变更时，重新计算值，并保存
  handleExpressionChange(rowIndex: number, colIndex: number, exp: string) {
    // 新的值
    const d: TableData = {...this.getTableData(rowIndex, colIndex), rowIndex, colIndex, exp }
    d.value = exp[0] === '=' ? this.getCalculateValue(exp.substring(1)) : exp
    this.setTableData(d)
  }

  // 展示desc对话框
  toggleDescModal() {
    const descModalVisible = !this.state.descModalVisible
    this.setState({ descModalVisible }, () => {
      if (descModalVisible && this.descInput.current) {
        this.descInput.current.focus()
      }
    })
  }
  handleDescChange(e: ChangeEvent<HTMLTextAreaElement>) {
    this.setState({descValue: e.target.value})
  }
  handleDescSave() {
    this.toggleDescModal()

    const {descData, descValue} = this.state
    this.setTableData({...descData, desc: descValue})
  }
  

  getTableData(rowIndex: number, colIndex: number) {
    return this.state.tableDataMap[`${rowIndex}_${colIndex}`]
  }
  setTableData(data: TableData) {
    this.setState({ tableDataMap: {
      ...this.state.tableDataMap,
      [`${data.rowIndex}_${data.colIndex}`]: data
    } })
  }
  getTableDataMap() {
    return this.state.tableDataMap
  }

  // 从列名获取真实值，如A2->...
  getValueFromCellName(s: string) {
    let v = 0
    const arr = s.match(/([A-Z]+)(\d+)/)
    if (arr && arr.length) {
      const col = arr[1]
      const row = parseInt(arr[2])
      let colNum = 0
      for (let i = col.length - 1; i >= 0; i--) {
        colNum += (LETTERS.indexOf(col[i]) + 1) * (Math.max(1, 26 * (col.length - 1 - i)))
      }
      const d: TableData = this.getTableData(row - 1, colNum - 1)
      if (d) {
        v = parseFloat(d.value)
      }
    }
    return v
  }
  getCalculateValue(exp: string) {
    // 去掉所有空格
    exp = exp.replace(/\s/g, '')
    // 解析整个计算串到队列
    const reg = /[\+\-\*\/\(\)]/
    const stack = []
    let start = 0
    for (let i = 0, len = exp.length; i < len; i++) {
      if (reg.test(exp[i])) {
        if (i > start) {
          stack.push(this.getValueFromCellName(exp.substring(start, i)))
        }
        stack.push(exp[i])
        start = i + 1
      } else if (i === len - 1) {
        stack.push(this.getValueFromCellName(exp.substring(start)))
      }
    }
    // 计算
    return eval(stack.join('')).toString()
  }

  render() {
    const columns = this.getColumns();
    const dataSource = this.getRows();

    return (
      <>
        <Table
          columns={columns}
          dataSource={dataSource}
          bordered={true}
          pagination={false}
          scroll={{x: true}}
        />

        <Modal
          visible={this.state.descModalVisible}
          title="Remark"
          onCancel={this.toggleDescModal}
          onOk={this.handleDescSave}
        >
          <div>
            <TextArea
              ref={this.descInput}
              value={this.state.descValue || ''}
              onChange={this.handleDescChange}
            />
          </div>
        </Modal>
      </>
    )
  }
}
