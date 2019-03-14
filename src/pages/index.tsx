import React from 'react';
import { Button, Modal } from 'antd';
import Clipboard from 'clipboard'
import Table, { TableData } from './Table'
import styles from './index.css'

/**
 * 实际的值存储到 data中，每次渲染根据行列数，动态获取数据
 * 数据更新也存到data中
 */
export default class Index extends React.PureComponent {
  readonly state = {
    colNum: 3, // 总列数
    rowNum: 3, // 总行数
    copyModalVisible: false,
  }
  table = React.createRef<Table>()

  constructor(props: {}) {
    super(props);

    this.handleAddColumn = this.handleAddColumn.bind(this)
    this.handleAddRow = this.handleAddRow.bind(this)
    this.toggleCopyModal = this.toggleCopyModal.bind(this)
  }

  componentDidMount() {
    const clipboard = new Clipboard('#copyBtn')
    clipboard.on('success', function(e) {
      e.clearSelection();
    });
  }

  // 添加列
  handleAddColumn() {
    this.setState({ colNum: this.state.colNum + 1 })
  }

  // 添加行
  handleAddRow() {
    this.setState({ rowNum: this.state.rowNum + 1 })
  }

  // 复制预览
  toggleCopyModal() {
    this.setState({ copyModalVisible: !this.state.copyModalVisible })
  }

  render() {
    const { rowNum, colNum, copyModalVisible } = this.state

    return (
      <div className={styles.page}>
        <p>
          <Button onClick={this.handleAddRow} type="primary">Add A Row</Button>
          &emsp;
          <Button onClick={this.handleAddColumn} type="primary">Add A Column</Button>
          &emsp;
          &emsp;
          <Button type="danger" onClick={this.toggleCopyModal}>Copy to clipboard</Button>
        </p>
        <p style={{color:'#999'}}><i>* 单元格支持简单四则运算表达式，以等号开头。如：=A1+B1*(C2-C1)+C2</i></p>

        <Table
          ref={this.table}
          rowNum={rowNum}
          colNum={colNum}
        />


        <Modal
          visible={copyModalVisible}
          title="Confirm"
          okText="Copy"
          cancelText="Cancel"
          okButtonProps={{id: 'copyBtn', 'data-clipboard-action': 'copy', 'data-clipboard-target': '#copyCnt'}}
          onCancel={this.toggleCopyModal}
          onOk={this.toggleCopyModal}
        >
          <div id="copyCnt" className={styles.prod}>
            <table>
              <tbody>
                {this.renderCopyRows()}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    );
  }

  renderCopyRows() {
    if (!this.table.current) {
      return null
    }
    const data = this.table.current.getTableDataMap()
    const {rowNum, colNum} = this.state
    const tdItem = (key: number, text: string, desc: string) => {
      return <td key={key}>{text}{desc ? <p>{desc}</p> : null}</td>
    }
    const cols = (rowIndex: number) => {
      const arr = []
      for (let i = 0; i < colNum; i++) {
        const d: TableData = data[`${rowIndex}_${i}`] || {}
        arr.push(tdItem(i, d.value, d.desc))
      }
      return arr
    }

    const rows = []
    for (let i = 0; i < rowNum; i++) {
      rows.push(<tr key={i}>{cols(i)}</tr>)
    }
    return rows 
  }
}
