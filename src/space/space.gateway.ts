import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({namespace: 'space'})
export class SpaceGateway  {
  constructor(private readonly spaceService: SpaceService) {}

  @WebSocketServer() server: Server;
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  @SubscribeMessage('createSpace')
  create(@MessageBody() createSpaceDto: CreateSpaceDto) {
    return this.spaceService.create(createSpaceDto);
  }

  @SubscribeMessage('signal')
  handleSignal(client: Socket, payload: { signal: any; peerId: string; room: string }) {
    // Forward the signaling data to the target peer
    console.log('signal received')
    this.server.to(payload.peerId).emit('signal', { peerId: client.id, signal: payload.signal });
    this.server.to(payload.room).emit('signal', { peerId: client.id, signal: payload.signal });
  }
  
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { room: string }) {
    client.join(payload.room);
    console.log(`Client ${client.id} joined room ${payload.room}`);

    // Notify other clients in the room about the new peer
    client.to(payload.room).emit('new-peer', client.id);
  }

  @SubscribeMessage('findAllSpace')
  findAll() {
    return this.spaceService.findAll();
  }

  @SubscribeMessage('findOneSpace')
  findOne(@MessageBody() id: number) {
    return this.spaceService.findOne(id);
  }

  @SubscribeMessage('updateSpace')
  update(@MessageBody() updateSpaceDto: UpdateSpaceDto) {
    return this.spaceService.update(updateSpaceDto.id, updateSpaceDto);
  }

  @SubscribeMessage('removeSpace')
  remove(@MessageBody() id: number) {
    return this.spaceService.remove(id);
  }
}
