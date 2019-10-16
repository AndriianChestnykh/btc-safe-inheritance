import React from 'react';
import * as utils from '../utils';
import config from '../config';

class UTXO extends React.Component {
  constructor(props) {
    super(props);
    this.getActionButtons = this.getActionButtons.bind(this);
    this.addTxWrapper = this.addTxWrapper.bind(this);
    this.sendToOwnerWrapper = this.sendToOwnerWrapper.bind(this);
    this.sendToHeirWrapper = this.sendToHeirWrapper.bind(this);
  }

  getActionButtons(actions){
    const buttons = {
      addTx: <button onClick={this.addTxWrapper}>Sign intermediate tx</button>,
      sendToOwner: <button onClick={this.sendToOwnerWrapper}>Widthraw to owner</button>,
      sendToHeir: <button onClick={this.sendToHeirWrapper}>Widthraw to heir</button>
    };

    return Object.keys(actions).map((action, index) => buttons[action] ? <div key={index}>{buttons[action]}</div>: '');
  }

  addTxWrapper(){
    const { network } = config;
    const tx = utils.signTx({
      childOwner: utils.getHDChild(config.owner.mnemonic, config.owner.derivationPath, network),
      childHeir: utils.getHDChild(config.heir.mnemonic, config.heir.derivationPath, network),
      txid: this.props.utxo.transaction_hash,
      output: this.props.utxo.index,
      amount: this.props.utxo.value,
      fee: 1000,
      sequenceFeed: { blocks: 5 },
      network
    });

    console.log(tx);

    this.props.actions['addTx'](tx);
  }

  sendToOwnerWrapper(){
    const { network } = config;
    const tx = utils.signToOwner({
      childPerson: utils.getHDChild(config.owner.mnemonic, config.owner.derivationPath, network),
      redeemScript: Buffer.from(this.props.redeem, 'hex'),
      txid: this.props.utxo.transaction_hash,
      output: this.props.utxo.index,
      amount: this.props.utxo.value,
      fee: 1000,
      network
    });
    utils.broadcastTx(tx.toHex());
  }

  sendToHeirWrapper(){
    const { network } = config;
    const tx = utils.signToHeir({
      childPerson: utils.getHDChild(config.heir.mnemonic, config.heir.derivationPath, network),
      redeemScript: Buffer.from(this.props.redeem, 'hex'),
      txid: this.props.utxo.transaction_hash,
      output: this.props.utxo.index,
      amount: this.props.utxo.value,
      fee: 1000,
      network
    });
    utils.broadcastTx(tx.toHex());
  }

  render(){
    return (<div style={{ wordWrap: "break-word" }}>
      <p><strong>UTXO {this.props.index + 1}</strong></p>
      <span>Transaction hash: {this.props.utxo.transaction_hash}</span><br/>
      <span>Index: {this.props.utxo.index}</span><br/>
      <span>Value: {this.props.utxo.value / (10**8) + ' BTC'}</span><br/><br/>
      { this.getActionButtons(this.props.actions) }<br/><br/>
    </div>)
  }
}

export default UTXO;